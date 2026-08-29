import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import os from 'os';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { safeLogger } from './server/security';

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // 1. Trust proxy for Cloud Run ingress reverse proxy
  app.set('trust proxy', 1);

  // 2. Strict Security Headers via Helmet (Clean CSP without unsafe-eval)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'", 'https:', 'http:', 'ws:', 'wss:'],
          frameAncestors: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' }
    })
  );

  // 3. CORS Configuration with Origin Validation
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / requests without origin (like same-origin browser fetches or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.length > 0) {
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error('CORS policy: Not allowed by origin allowlist'));
        }
        
        // In local/dev/container preview, permit same-host origin
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
    })
  );

  // 4. Cookie Parser & JSON Body Parser with strict payload limits (1MB)
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Rate Limiters
  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please slow down.', code: 'RATE_LIMIT_EXCEEDED' }
  });

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'AI request limit reached (max 30/min).', code: 'AI_RATE_LIMIT_EXCEEDED' }
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts.', code: 'AUTH_RATE_LIMIT_EXCEEDED' }
  });

  app.use('/api/', globalLimiter);
  app.use('/api/ai/', aiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/bootstrap', authLimiter);

  // 6. Request Logging with Sensitive Secret Redaction
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        safeLogger.info(`${req.method} ${req.path} [${res.statusCode}] - ${duration}ms`, {
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
      });
    }
    next();
  });

  // 7. Mount API Routes FIRST
  app.use('/api', apiRouter);

  // 8. Vite Middleware (Dev) or Static Assets (Prod)
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const localUrl = `http://localhost:${PORT}`;
    const addresses = Object.values(os.networkInterfaces())
      .flat()
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter(item => item.family === 'IPv4' && !item.internal)
      .map(item => `http://${item.address}:${PORT}`);

    safeLogger.info(`NEXSUS SOC server is running.`);
    console.log('');
    console.log(`  Local:   ${localUrl}`);
    for (const address of addresses) {
      console.log(`  Network: ${address}`);
    }
    console.log('');
  });
}

startServer().catch((err) => {
  safeLogger.error('Fatal Server Boot Failure', { error: err.message, stack: err.stack });
  process.exit(1);
});

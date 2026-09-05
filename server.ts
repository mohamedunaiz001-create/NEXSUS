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
  if (isProduction) {
    const required = ['JWT_SECRET', 'CSRF_SECRET', 'ALLOWED_ORIGINS', 'TOOL_ENCRYPTION_KEY'];
    const missing = required.filter(name => !process.env[name]?.trim());
    if (missing.length) throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    if ((process.env.JWT_SECRET || '').length < 64 || (process.env.CSRF_SECRET || '').length < 64) {
      throw new Error('JWT_SECRET and CSRF_SECRET must each be at least 64 characters in production.');
    }
    if (!/^[0-9a-fA-F]{64}$/.test(process.env.TOOL_ENCRYPTION_KEY || '')) {
      throw new Error('TOOL_ENCRYPTION_KEY must be a 64-character hex string (32 bytes) in production. Generate with: openssl rand -hex 32');
    }
  }

  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' }
  }));

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (!isProduction) return callback(null, true);
      return callback(new Error('CORS policy: origin is not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many requests. Please slow down.', code: 'RATE_LIMIT_EXCEEDED' } });
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'AI request limit reached (max 30/min).', code: 'AI_RATE_LIMIT_EXCEEDED' } });
  const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Too many authentication attempts.', code: 'AUTH_RATE_LIMIT_EXCEEDED' } });
  const toolExecuteLimiter = rateLimit({ windowMs: 60 * 1000, max: 40, standardHeaders: true, legacyHeaders: false, message: { success: false, error: 'Tool execution limit reached (max 40/min).', code: 'TOOL_RATE_LIMIT_EXCEEDED' } });

  app.use('/api/', globalLimiter);
  app.use('/api/ai/', aiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/bootstrap', authLimiter);
  app.use('/api/tools/execute', toolExecuteLimiter);

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const start = Date.now();
      res.on('finish', () => safeLogger.info(`${req.method} ${req.path} [${res.statusCode}] - ${Date.now() - start}ms`, { ip: req.ip, userAgent: req.headers['user-agent'] }));
    }
    next();
  });

  app.use('/api', apiRouter);

  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true, hmr: false }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    const localUrl = `http://localhost:${PORT}`;
    const addresses = Object.values(os.networkInterfaces()).flat().filter((item): item is NonNullable<typeof item> => Boolean(item)).filter(item => item.family === 'IPv4' && !item.internal).map(item => `http://${item.address}:${PORT}`);
    console.log(`\nNEXSUS SOC server is running.\n  Local:   ${localUrl}`);
    for (const address of addresses) console.log(`  Network: ${address}`);
    console.log('');
  });
}

startServer().catch((err) => { safeLogger.error('Fatal Server Boot Failure', { error: err.message, stack: err.stack }); process.exit(1); });

# Production-Grade Pages — Added

This pass adds the pages from "High-value production-grade pages people often
forget" that were missing from the NEXSUS codebase. Nothing existing was
removed; everything below is additive.

## How it's wired

NEXSUS's authenticated shell (`App.tsx`) is a single-route, state-driven SPA
(`activeNav`) — there was no router at all. Rather than bolt on a full router
dependency, two layers were added:

1. **`src/utils/publicRouter.ts`** — a ~30-line pathname router (pushState +
   popstate) used only for the small, fixed set of "logged-out" utility
   routes below. `src/main.tsx` now checks `isPublicRoute()` on load and
   renders `PublicApp` (chrome-free) instead of the dashboard `App` when the
   URL matches one of them. The Express server (`server.ts`) already falls
   back to `index.html` for every path, so these are safe to deep-link,
   bookmark, or share.
2. **New `activeNav` cases** inside the existing dashboard shell, for pages
   that make sense only *after* sign-in (Billing, Support, Help Center, QA
   states gallery).

## Legal (`/legal`, `/legal/<slug>`)

One generic renderer (`LegalPages.tsx`) driven by a content table — adds all
15 docs: Privacy Policy, Terms of Service, Cookie Policy, Cookie
Preferences, Refund Policy, Cancellation Policy, Shipping Policy,
Return/Exchange Policy, Disclaimer, Accessibility Statement, Data Processing
Agreement, Acceptable Use Policy, Security Policy, Responsible Disclosure,
Community Guidelines — plus a `/legal` hub/index page.

> Content is template copy for structural completeness, not legal advice —
> have counsel review before relying on it in production.

## Customer lifecycle

- **Auth** (`AuthPages.tsx`, public routes `/login`, `/register`,
  `/verify-email`, `/forgot-password`, `/reset-password`, `/onboarding`) —
  UI is complete and client-validated; wire the submit handlers to
  `server/auth.ts`'s `/api/auth/*` endpoints for a real identity provider.
- **Account/Billing** (`AccountPages.tsx`, in-app nav: Billing → Upgrade /
  Downgrade / Cancel Subscription) and **payment result pages** (Success /
  Failed / Pending) — plan data is mocked; connect to your billing provider.
- **Support** (`SupportPages.tsx`) — Support and Help Center, each available
  both as a public route (`/support`, `/help-center`) and as an in-app nav
  item so a signed-in operator doesn't have to leave the dashboard chrome.

## UX states

- **Standalone full-screen pages** (`StatusPages.tsx`): 404, 403, 500,
  Maintenance, Offline, Session Expired — reachable at `/404`, `/403`,
  `/500`, `/maintenance`, `/offline`, `/session-expired`, and `/404` is also
  the catch-all for any unrecognized public path.
- **Reusable embeddable components** (also in `StatusPages.tsx`):
  `EmptyState`, `NoSearchResultsState`, `LoadingState`, `ErrorState`,
  `SuccessState` — drop these into any panel/widget instead of a bespoke
  blank div or spinner.
- **QA gallery** — new in-app nav item "UX States (QA)" renders every state
  component together plus links to the standalone pages, so they're never
  "invisible until it breaks in prod."

## Navigation

`Sidebar.tsx` gained an **ACCOUNT & SUPPORT** section (Billing, Help Center,
Support, Legal & Compliance) and an **UX States (QA)** item under
Operations.

## Verified

`npx tsc --noEmit` and `npx vite build` both pass clean against this
checkout (Node 22, Vite 6, React 19).

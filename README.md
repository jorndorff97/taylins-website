## Taylin Store – Tech Stack & Hosting

This project is a **fully custom e‑commerce site** (storefront + admin) for physical products, built without Shopify.

### Chosen stack

- **Frontend**
  - **Framework**: Next.js (App Router) with React and TypeScript.
  - **Styling**: Tailwind CSS (with utility‑first styling and reusable components).
- **Backend & API**
  - **Runtime**: Next.js API routes (Node.js) for server‑side business logic.
  - **Auth**: NextAuth (for secure admin login and optional customer accounts).
  - **ORM**: Prisma (type‑safe database access and migrations).
- **Database**
  - **Engine**: PostgreSQL.
  - **Provider**: Neon (managed, serverless Postgres, well‑suited for Vercel).
- **Payments**
  - **Provider**: Stripe (Stripe Checkout / Payment Intents with webhooks for order state).
- **Hosting**
  - **App hosting**: Vercel (deploy Next.js frontend + API routes).
  - **Database hosting**: Neon (cloud Postgres).

These choices will guide all subsequent scaffolding, schema design, and integration work.

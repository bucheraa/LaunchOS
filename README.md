# LaunchOS

**AI-powered launch workspace for mobile apps.**  
Generate store copy, plan screenshots, research keywords, track A/B experiments, and push directly to App Store Connect and Google Play — all in one place.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | NextAuth.js (credentials + Google OAuth) |
| Storage | Supabase Storage |
| AI | OpenAI GPT-4o |
| Payments | Stripe |
| Rate limiting | Redis (Upstash) |
| Deployment | Vercel |

---

## Local Development

### Local Demo on macOS

Run the demo locally without PostgreSQL, Supabase, Stripe, Redis, or API keys:

```bash
npm install
npm run dev:demo
# → http://localhost:3000
```

What this does:

- Copies `.env.demo` to `.env.local`
- Enables an in-memory demo workspace with automatic demo sign-in
- Replaces database-backed mutations and external integrations with local mock behaviour

Notes:

- Demo changes are stored in memory only and reset when the dev server restarts.
- The production/local full-stack setup below is still available when you want the real database flow.

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- An [OpenAI](https://platform.openai.com) account

### 1. Clone and install

```bash
git clone https://github.com/bucheraa/launchos.git
cd launchos
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` following the **Credentials Setup** section below.

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Seed demo data (optional)

```bash
npm run db:seed
# Login: demo@launchos.dev / demo1234
```

### 5. Start dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Credentials Setup

### Supabase (Database + Storage)

1. Create a project at [supabase.com](https://supabase.com)
2. **Settings → Database → Connection string**
   - `DATABASE_URL` → **Transaction pooler** URL (port `6543`) + append `?pgbouncer=true`
   - `DIRECT_URL` → **Direct connection** URL (port `5432`)
3. **Settings → API**
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service role key (**keep secret**)
4. **Storage → New bucket** × 2:
   - `launchos-assets` — set to **Private**
   - `mockups` — set to **Public**

### NextAuth

```bash
openssl rand -base64 32   # → NEXTAUTH_SECRET
```

Set `NEXTAUTH_URL` to your app URL (e.g. `https://your-app.vercel.app`).

### Google OAuth *(optional — "Sign in with Google")*

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create OAuth 2.0 Client ID** (Web)
2. Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
3. Copy → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### OpenAI

[platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create key → `OPENAI_API_KEY`

### Stripe

1. **Developers → API keys** → `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
2. **Create two products** (Products → Add product):
   - **Starter** — $49/month → copy Price ID → `STRIPE_STARTER_PRICE_ID`
   - **Growth** — $149/month → copy Price ID → `STRIPE_GROWTH_PRICE_ID`
3. **Configure webhook** (Developers → Webhooks → Add endpoint):
   - URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Signing secret → `STRIPE_WEBHOOK_SECRET`
4. Local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Apple App Store Connect

1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access → Integrations → App Store Connect API**
2. Create API key with **App Manager** role — download `.p8` (one-time only)
3. Set:
   - `APPLE_ISSUER_ID` — Issuer ID shown on the page
   - `APPLE_KEY_ID` — Key ID shown on the page
   - `APPLE_PRIVATE_KEY` — full content of the `.p8` file, with literal newlines replaced by `\n`:
     ```
     APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----"
     ```

### Google Play Developer

1. [Google Cloud Console](https://console.cloud.google.com) → Enable **Google Play Android Developer API**
2. **IAM & Admin → Service Accounts** → Create service account → add **Editor** role
3. **Keys → Add Key → JSON** → download
4. From the JSON file:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (replace literal `\n` as above)
5. [Google Play Console](https://play.google.com/console) → **Setup → API access** → link project → grant service account access

### AppFollow *(optional — keyword volume & difficulty)*

Without AppFollow, LaunchOS uses iTunes Autocomplete (free, real suggestions, no volume scores).

1. Subscribe at [appfollow.io](https://appfollow.io)
2. **Account → API** → copy key → `APPFOLLOW_API_KEY`

### Redis / Upstash *(optional — rate limiting)*

Not required for local development (falls back to in-process store).  
Required for production to prevent AI route abuse.

1. Create a database at [upstash.com](https://upstash.com) (free tier)
2. Copy the **Redis URL** (`rediss://...`) → `REDIS_URL`

---

## Deployment (Vercel)

### 1. Import repo

[vercel.com/new](https://vercel.com/new) → import your GitHub repo → framework auto-detected as Next.js.

### 2. Add environment variables

In **Project Settings → Environment Variables**, add every variable from `.env.example`.  
The `vercel.json` maps them to Vercel secrets (e.g. `@database_url`) — the variable names must match.

### 3. Deploy

```bash
git push origin main
```

Vercel build runs: `prisma generate && prisma db push && next build`

### 4. After first deploy

- Register the **Stripe webhook** with your production URL (see Stripe setup above)
- Verify the **Supabase Storage** buckets exist and have the correct visibility

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login, signup
│   ├── (dashboard)/        # All authenticated pages + layout
│   │   ├── dashboard/      # Main dashboard
│   │   ├── projects/       # Project list + detail tabs
│   │   ├── settings/       # Integrations, billing, account
│   │   └── onboarding/     # 4-step new-user wizard
│   ├── api/
│   │   ├── auth/           # NextAuth + credentials signup
│   │   ├── billing/        # checkout + portal endpoints
│   │   ├── integrations/   # App Store Connect, Play, RevenueCat
│   │   ├── onboarding/     # Progress tracking
│   │   ├── projects/       # CRUD + AI features (analyze, copy, screenshots…)
│   │   └── webhooks/       # Stripe webhook handler
│   └── not-found.tsx
├── components/
│   ├── layout/             # Sidebar, header
│   ├── onboarding/         # Wizard component
│   ├── projects/           # List card, detail view, 7 feature tabs
│   ├── settings/           # IntegrationsPanel, BillingPanel
│   ├── shared/             # Badges, loading states, empty states
│   └── ui/                 # Radix-based primitives
├── lib/
│   ├── ai/                 # OpenAI GPT-4o service
│   ├── auth/               # NextAuth options + session helpers
│   ├── db/                 # Prisma client, Supabase client
│   ├── integrations/
│   │   ├── apple/          # App Store Connect (ES256 JWT via jose)
│   │   ├── google/         # Google Play Developer (RS256 via jose)
│   │   ├── keywords/       # AppFollow + iTunes Autocomplete service
│   │   ├── competitors/    # iTunes Search + google-play-scraper
│   │   └── stripe/         # Checkout, portal, webhook helpers
│   ├── screenshot/         # satori + @resvg/resvg-js PNG generator
│   ├── storage/            # Supabase Storage (upload, signed URLs)
│   └── rate-limit.ts       # Redis sliding-window rate limiter
├── middleware.ts            # Route protection (auth guard)
└── types/                  # Extended Prisma + NextAuth types
```

---

## Feature Overview

| Feature | How it works |
|---|---|
| **AI Analysis** | GPT-4o analyzes app description → audience segments, value props, messaging angles |
| **Store Copy Generator** | AI writes App Store / Play Store listings per audience + locale |
| **Keyword Research** | AppFollow (paid, with scores) or iTunes Autocomplete (free fallback) |
| **Competitor Analysis** | Discovers iOS + Android competitors via public APIs; no API key required |
| **Screenshot Planner** | AI plans a conversion-optimized screenshot sequence |
| **Screenshot Mockups** | Server-side PNG generation with satori + resvg (Vercel-compatible, no Canvas) |
| **Experiment Planner** | AI proposes A/B tests; closed-loop CVR uplift tracking |
| **Store Push** | Pushes listings to App Store Connect (ES256 JWT) and Google Play (RS256 SA) |
| **Onboarding** | 4-step wizard runs the full AI analysis automatically for new users |
| **Billing** | Stripe Checkout + Customer Portal; webhook downgrades plan on cancellation |

---

## Demo Account

After `npm run db:seed`:

| | |
|---|---|
| Email | `demo@launchos.dev` |
| Password | `demo1234` |
| Project | FitTrack Pro (iOS + Android, Freemium) |

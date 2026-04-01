# LaunchOS

**AI-powered launch workspace for mobile apps.**

LaunchOS helps mobile app teams generate optimized store listings, screenshot plans, A/B experiment strategies, and actionable growth recommendations — all powered by GPT-4o.

---

## Features

- **AI App Analysis** — Extract audience segments, value props, and messaging angles
- **Store Copy Generator** — iOS & Android listings in English and German, multiple variants
- **Screenshot Planner** — Structured screenshot sequences with conversion goals
- **Experiment Planner** — AI-suggested A/B tests with hypotheses and metrics
- **Recommendations Dashboard** — Prioritized to-do list of ASO improvements
- **Integration layer** — App Store Connect, Google Play, RevenueCat, Stripe (architecture ready)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS + Radix UI |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js |
| AI | OpenAI GPT-4o |
| Queue | BullMQ + Redis |
| Storage | S3-compatible |
| Billing | Stripe |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for background jobs)
- OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/your-org/launchos.git
cd launchos
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. At minimum you need:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- `OPENAI_API_KEY`

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login:** `demo@launchos.dev` / `demo1234`

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, signup pages
│   ├── (dashboard)/        # Authenticated app
│   │   ├── dashboard/      # Main dashboard
│   │   ├── projects/       # Project list & detail
│   │   └── settings/       # Workspace settings
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth + signup
│   │   ├── projects/       # Project CRUD + AI generation
│   │   └── webhooks/       # Stripe webhooks
│   └── page.tsx            # Landing page
│
├── components/
│   ├── ui/                 # Primitive UI components (Radix-based)
│   ├── layout/             # Sidebar, header
│   ├── projects/           # Project forms, tabs, detail view
│   └── shared/             # Empty states, loading states, badges
│
├── lib/
│   ├── ai/                 # OpenAI client, prompts, service functions
│   ├── auth/               # NextAuth config, session helpers
│   ├── db/                 # Prisma client
│   ├── integrations/       # Apple, Google, RevenueCat, Stripe clients
│   ├── queue/              # BullMQ setup
│   ├── storage/            # S3 client
│   ├── utils/              # Logger, helpers
│   └── validations/        # Zod schemas
│
├── types/                  # TypeScript types
└── hooks/                  # React hooks (useToast)

prisma/
├── schema.prisma           # Full data model
└── seed.ts                 # Demo data
```

---

## Database

The Prisma schema covers:

| Model | Description |
|---|---|
| `User` / `Account` / `Session` | NextAuth auth models |
| `Workspace` / `WorkspaceMember` | Multi-workspace support |
| `Project` | The core unit — one app per project |
| `AppAnalysis` | AI analysis results |
| `AudienceSegment` | Target user personas |
| `ValueProp` | Core value propositions |
| `MessagingAngle` | Copy angles per audience |
| `ListingVariant` | iOS/Android store listing versions |
| `ScreenshotPlan` | Structured screenshot sequences |
| `Experiment` | A/B test hypotheses and results |
| `Recommendation` | Prioritized improvement suggestions |
| `UploadedAsset` | Screenshots, icons, etc. |
| `BillingCustomer` | Stripe subscription tracking |
| `Integration` | Connected third-party services |

---

## AI Service

All AI calls are encapsulated in `src/lib/ai/service.ts`:

```typescript
analyzeProductInput(description, extraContext)
generateAudienceSegments(projectContext)
generateMessagingAngles(projectContext, segments)
generateStoreCopy(projectContext, platform, locale, audienceContext, messagingContext)
generateScreenshotPlan(projectContext, platform, audienceContext)
generateExperimentIdeas(projectContext, existingVariants)
generateRecommendations(projectContext)
```

All functions use structured JSON outputs via `response_format: { type: "json_object" }`.

---

## Integrations

The architecture has stub implementations ready for:

- **Apple App Store Connect API** — `src/lib/integrations/apple/client.ts`
- **Google Play Developer API** — `src/lib/integrations/google/client.ts`  
- **RevenueCat** — `src/lib/integrations/revenuecat/client.ts`
- **Stripe** — `src/lib/integrations/stripe/client.ts` (fully implemented)

Each integration is a class with typed methods. Plug in real credentials to activate.

---

## Deployment

### Environment Variables

Set all variables from `.env.example` in your deployment platform.

### Database

Run migrations in production:
```bash
npx prisma migrate deploy
```

### Build

```bash
npm run build
npm start
```

---

## License

MIT

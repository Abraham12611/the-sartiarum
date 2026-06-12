# Sartiarum — AI Writing Workspace

> Write clearly. Think deeply. Grow with AI.

## Quick start

```bash
# 1. Clone and install
git clone https://github.com/Abraham12611/the-sartiarum.git
cd the-sartiarum
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Run the Supabase schema
# Paste the SQL from docs/phase-1-schema.sql into your Supabase SQL editor and run it.

# 4. Start the dev server
pnpm dev
```

## Project structure

```
app/                  # Next.js App Router pages + API routes
  (auth)/             # Login, signup, forgot-password
  (app)/              # Dashboard shell (sidebar)
    dashboard/        # Board view
    doc/[id]/         # Writer (focus shell, no sidebar)
    settings/         # Profile, AI prefs, billing
  api/ai/             # Streaming AI routes (write, rewrite, summarize, expand, brainstorm, autocomplete)
  api/stripe/         # Checkout, portal, webhook
  auth/callback/      # OAuth handler
components/
  ui/                 # shadcn primitives
  sidebar/            # Sidebar, SpaceTree, BoardItem, UsageMeter
  dashboard/          # BoardView, DocCard, SectionTabs
  editor/             # TipTap editor, Toolbar, BubbleMenu, SlashMenu, Autocomplete
  writer/             # AiPanel, WriterSettings, VersionHistory, ExportDialog
lib/
  supabase/           # server.ts, client.ts, middleware.ts
  db/                 # Drizzle schema + client
  ai/                 # openrouter.ts, prompts.ts
  usage/              # entitlement.ts
  actions/            # Server actions (documents, boards, spaces)
```

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (Postgres + Auth + Storage + RLS) |
| ORM | Drizzle |
| AI | Vercel AI SDK v6 + OpenRouter |
| Editor | TipTap |
| UI | Tailwind v4 + shadcn/ui |
| Billing | Stripe |
| Rate limiting | Upstash Redis |
| Analytics | PostHog |
| Error tracking | Sentry |

## Git workflow

See `guidelines/Guidelines.md` for the full workflow. Never push directly to `main` or `develop`.

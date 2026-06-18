# Sartiarum â€” Task Tracker

> **How to use:** Before starting any work, read this file. Update statuses as you go. Every coding task must be planned here and confirmed before code is written. Statuses: `todo` Â· `in-progress` Â· `done`.
> **Git rule:** every task group below maps to a feature branch â†’ PR into `develop`. Never push directly to `main` or `develop`.

---

## Current focus: Landing page (pre-Phase 1)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Navbar | done | Sticky, backdrop blur, logo, nav links, "Join waitlist" button |
| 2 | Hero section | done | Two-column, illustration + product preview PNGs, email form |
| 3 | Workspace section (Â§2) | done | Centered, product preview PNG, 4 benefits |
| 4 | Write your way section (Â§3) | done | Copy left, mockup right |
| 5 | Assistant mode section (Â§4) | done | Mockup left, copy right |
| 6 | Coaching mode section (Â§5) | done | Copy left, mockup right |
| 7 | Research & sources section (Â§6) | done | Mockup left, copy right |
| 8 | Organize your work section (Â§7) | done | Copy left, mockup right |
| 9 | Learning paths section (Â§8) | done | Copy left, mockup right |
| 10 | Waitlist + footer section (Â§9) | done | Doodle PNGs, email form, footer |
| 11 | LaunchList integration | done | Custom form (widget-diy.js) wired to both hero form and waitlist form |

---

## Phase 1 â€” Core Writing Workspace (Days 1â€“5)
*Reference: `src/imports/sartiarum-details/phase-1-core-writing-workspace.md` and `phase-1-build-kickoff.md`*

### Day 1 â€” Foundation
*Branch: `feat/UNI-001-foundation`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 12 | Next.js + Tailwind + shadcn scaffold | done | App Router, TypeScript, pnpm |
| 13 | All Phase 1 dependencies installed | done | TipTap, AI SDK, Supabase SSR, Drizzle, Stripe, Upstash, Sentry, PostHog |
| 14 | Drizzle setup (`lib/db/schema.ts`, `drizzle.config.ts`) | done | Typed query layer; all 8 tables defined |
| 15 | Supabase clients (`server.ts`, `client.ts`, `middleware.ts`) | done | SSR-safe; cookie handling correct |
| 16 | Route protection middleware (`middleware.ts`) | done | `/app/*` â†’ `/login` when logged out |
| 17 | Auth callback handler (`/auth/callback`) | done | OAuth + magic-link code exchange |
| 18 | Supabase schema applied (all 8 tables + RLS) | done | Applied via MCP; 0 security warnings |
| 19 | New-user seed trigger | done | Profile â†’ Space â†’ Board â†’ 3 Sections â†’ Subscription â†’ Welcome doc |
| 20 | All AI route stubs created | done | write, rewrite, summarize, expand, brainstorm, autocomplete |
| 21 | Server actions stubs created | done | documents.ts, boards.ts, spaces.ts |
| 22 | `.env.example` + `.env.local` template | done | All variable names documented |
| 23 | Code pushed to GitHub (`main` + `develop` branches) | done | https://github.com/Abraham12611/the-sartiarum |
| 24 | Enable Email + Google OAuth in Supabase dashboard | todo | Set redirect URL to `/auth/callback` |
| 25 | Fill in `.env.local` (DATABASE_URL, SERVICE_ROLE_KEY, OPENROUTER_API_KEY) | todo | Needed before `pnpm dev` works |
| 26 | Deploy skeleton to Vercel + verify `/app` â†’ `/login` redirect | todo | Day 1 done-check from kickoff doc |

---

### Day 2 - Editor + Organization
*Branch: `feat/UNI-133-day2-gaps`*
*Reference: `phase-1-core-writing-workspace.md` section 3.2-3.3, `wireframe-spec.md` section 3-4, `note-editor-wireframe-spec.md`*

#### 2A - App shell & routing
| # | Task | Status | Notes |
|---|------|--------|-------|
| 27 | Dashboard shell layout (`app/(app)/layout.tsx`) | done | Sidebar + main workspace shell implemented |
| 28 | Writer focus shell layout (`app/(app)/doc/[id]/layout.tsx`) | done | Focus shell without dashboard sidebar implemented |
| 29 | Root redirect (`/` -> `/app` if logged in, else auth entry) | done | Server auth check and redirect flow implemented |

#### 2B - Sidebar
| # | Task | Status | Notes |
|---|------|--------|-------|
| 30 | Sidebar component skeleton (`components/sidebar/Sidebar.tsx`) | done | Collapsible sidebar with icon rail behavior implemented |
| 31 | Logo + Sartiarum wordmark in sidebar header | done | Wordmark integrated in sidebar header |
| 32 | Spaces -> Boards tree (`components/sidebar/SpaceTree.tsx`) | done | Collapsible space-to-board hierarchy implemented |
| 33 | Pinned boards section (<=5 boards) | done | Pinned section implemented and rendered at top |
| 34 | "+ New" affordance (doc / board / space) | done | Sidebar + New now creates document, board, and space |
| 35 | Global search icon (placeholder for now) | done | Ctrl/Cmd+K search modal wired and board navigation connected |
| 36 | Primary nav links (Learn, Plan - greyed out, Phase 4/5) | done | Links rendered with disabled/soon treatment |
| 37 | Account + usage block at sidebar bottom | done | Profile card, usage meter, and sign-out present |
| 38 | Sidebar data fetching (spaces + boards from Drizzle) | done | Server-side fetch and hydration wired in layout |

#### 2C - Dashboard / Board view
| # | Task | Status | Notes |
|---|------|--------|-------|
| 39 | Dashboard page (`app/(app)/dashboard/page.tsx`) | done | Active board selection and data loading implemented |
| 40 | Board header (name, sort dropdown, search, + New doc button) | done | Header controls implemented |
| 41 | Section filter tabs (All / Ideas / Drafts / Final) | done | Status tabs implemented and filtering wired |
| 42 | Document card grid (`components/dashboard/DocCard.tsx`) | done | Cards with metadata and actions rendered |
| 43 | Document card "..." menu (Rename, Move to board, Delete) | done | Rename, move, and delete actions wired to server actions |
| 44 | Empty board state | done | Empty state + create CTA implemented |
| 45 | Loading skeleton for board view | done | Added dashboard loading skeleton route with card placeholders |
| 46 | Create new document flow | done | Create action + redirect to writer implemented |

#### 2D - TipTap editor
| # | Task | Status | Notes |
|---|------|--------|-------|
| 47 | TipTap editor component (`components/editor/Editor.tsx`) | done | StarterKit + core extensions implemented |
| 48 | Formatting toolbar (`components/editor/Toolbar.tsx`) | done | Toolbar controls implemented |
| 49 | Serif heading styling | done | Heading typography treatment implemented |
| 50 | Slash menu (`components/editor/SlashMenu.tsx`) | done | Slash command menu with Day 2 commands implemented |
| 51 | Bubble menu on text selection (`components/editor/BubbleMenu.tsx`) | done | Bubble menu implemented with formatting/AI stubs |
| 52 | Word count + read-time footer | done | Live footer metrics implemented |
| 53 | Focus mode toggle | done | Toggle and focus-mode behavior implemented |
| 54 | Document title (inline-editable in Writer top bar) | done | Inline edit + persisted title updates implemented |
| 55 | Saved / Saving... passive status indicator | done | Passive save status indicator implemented |

#### 2E - Auto-save + versioning
| # | Task | Status | Notes |
|---|------|--------|-------|
| 56 | Auto-save on editor change (debounced ~10s) | done | Debounced save implemented |
| 57 | Auto-save on blur | done | Blur-triggered immediate save implemented |
| 58 | Version snapshot before any AI action | done | Snapshot inserted before every Day 3 AI action request |
| 59 | Version history panel UI (`components/writer/VersionHistory.tsx`) | done | History panel with grouped versions implemented |
| 60 | Restore version | done | Restore flow wired to server action |

#### 2F - Writer page wiring
| # | Task | Status | Notes |
|---|------|--------|-------|
| 61 | Writer page (`app/(app)/doc/[id]/page.tsx`) | done | Document fetch and writer mount implemented |
| 62 | Compose column shell (`components/writer/ComposePanel.tsx`) | done | Compose panel and Day 3 action stubs implemented |
| 63 | Assistant column shell (`components/writer/AssistantPanel.tsx`) | done | Collapsible assistant rail/panel implemented |
| 64 | Writer settings dropdowns (Tone / Length / Audience) | done | Settings persisted via server actions |
| 65 | Back to Dashboard button in focus shell top bar | done | Navigation back control implemented |
| 66 | Export button placeholder in top bar | done | Placeholder present (Day 4 target) |

#### 2G - State coverage (required before Day 3)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 67 | Loading state: editor skeleton while document fetches | done | Added writer loading skeleton route to prevent blank flashes |
| 68 | Empty state: blank editor with invitation copy | done | Editor placeholder/empty invitation copy present |
| 69 | Error state: document not found / unauthorized | done | Added writer document not-found state with safe dashboard return path |
| 70 | Error state: save failed | done | Save failure now shows retry CTA and toast-style alert in writer view |

---
### Day 3 â€” AI Actions
*Branch: `feat/UNI-134-day3-ai-actions`*
*Prep done: prompt and routing strategy docs in `docs/ai/`*
*Current status: backend AI gate/router/prompt wiring landed in `feat/UNI-134-day3-prompt-routing`; UI action wiring and streaming UX are next.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 71 | Wire Compose panel prompt â†’ `/api/ai/write` (streaming) | in-progress | Compose prompt is wired; next pass to tighten stream protocol + Stop button UX |
| 72 | Wire Rewrite button â†’ `/api/ai/rewrite` | in-progress | Route wired with selection replacement and pre-AI snapshot |
| 73 | Wire Summarize button â†’ `/api/ai/summarize` | in-progress | Route wired and inserts summary block into editor |
| 74 | Wire Expand button â†’ `/api/ai/expand` | in-progress | Route wired with selection replacement and pre-AI snapshot |
| 75 | Wire Brainstorm button â†’ `/api/ai/brainstorm` | in-progress | Route wired and inserts brainstorm bullets at cursor |
| 76 | Streaming UX â€” inline shimmer + Stop button | in-progress | Streaming preview + Stop wired in Compose panel; final polish/QA pending |
| 77 | Error + retry affordance for all AI actions | in-progress | Per-action retry wired in Compose panel; validating edge cases |
| 78 | Writer settings passed to every AI route (tone/length/audience) | done | AI routes now resolve tone/length/audience from owned document row server-side (with safe fallback) |
| 79 | `ai_usage` logging confirmed working (check Supabase) | done | Verified in Supabase via MCP with live rows across actions/models and prompt versions |

---

### Day 4 â€” Autocomplete + Versions + Export
*Branch: `feat/UNI-004-autocomplete-versions-export`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 80 | Ghost-text autocomplete (ProseMirror decoration) | todo | Tab to accept, Esc/any key to dismiss; debounce 400â€“600ms |
| 81 | Autocomplete fires only mid/end of sentence, never mid-word | todo | Regex check before firing |
| 82 | Autocomplete default-off for first session | todo | `autocomplete_enabled = false` in seed; prompt to enable after first manual gen |
| 83 | Autocomplete toggle in settings | todo | Persists to `profiles.autocomplete_enabled` |
| 84 | Version history panel fully wired | todo | Real data from `getDocumentVersions()`; restore flow end-to-end |
| 85 | Export to `.md` | todo | Serialize TipTap JSON â†’ Markdown; trigger browser download |
| 86 | Export to `.docx` | todo | Server-side via `/api/export/docx`; stream file back |
| 87 | Deferred-signup scratch editor on landing | todo | Anonymous visitor gets 1 free generation; wall on save/2nd gen |
| 88 | Global search modal | todo | Postgres full-text search across documents; keyboard shortcut âŒ˜K |

---

### Day 5 â€” Billing + Polish + Ship
*Branch: `feat/UNI-005-billing-and-ship`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 89 | Stripe products + prices created (test mode) | todo | $20/mo + $200/yr; store price IDs in env |
| 90 | `/api/stripe/checkout` route | todo | Creates checkout session; redirects to Stripe |
| 91 | `/api/stripe/portal` route | todo | Customer portal for plan management |
| 92 | `/api/stripe/webhook` route | todo | Updates `subscriptions` table on payment events |
| 93 | Entitlement check wired to Upstash rate limits | todo | Trial cap (~50 generations); paid = unlimited |
| 94 | Usage meter in sidebar (% of trial used) | todo | Queries `ai_usage` count vs trial limit |
| 95 | Soft paywall modal (trial ended / limit hit) | todo | Let current action finish, then prompt; never hard-crash |
| 96 | Billing settings page (`/app/settings/billing`) | todo | Plan name, usage meter, trial countdown, Stripe portal link |
| 97 | PostHog setup + "first AI-assisted paragraph kept" event | todo | Install posthog-js; fire on first accepted generation |
| 98 | Sentry setup (frontend + API routes) | todo | `@sentry/nextjs` init; source maps on Vercel |
| 99 | Empty states polished on all surfaces | todo | Illustration or icon + short copy + CTA on every empty screen |
| 100 | Error states polished â€” no dead ends anywhere | todo | Every AI call has retry; every page has graceful fallback |
| 101 | QA against Phase 1 acceptance criteria | todo | See `phase-1-core-writing-workspace.md` Â§12 |
| 102 | Production deploy to Vercel + feature flag in PostHog | todo | Flag: `phase-1-live`; flip to enable for real users |

---

## Phase 2 â€” Coaching & Voice (Days 6â€“12)
*Reference: `src/imports/sartiarum-details/phase-2-coaching-and-voice.md`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 103 | Mastra setup + coaching agent with memory | todo | Branch: `feat/UNI-006-mastra-coaching-agent` |
| 104 | [Assist \| Coach] segmented toggle in Writer top bar | todo | Replaces "AI Assistant â—" pill |
| 105 | Coaching panel (Socratic questions, no auto-edits, markers) | todo | Never writes into the doc |
| 106 | Writing metrics computation + fingerprint dashboard | todo | Sentence variance, filler rate, passive voice, readability |
| 107 | Voice ingestion (paste samples/links â†’ structured profile) | todo | Zod schema; stored in `voice_profiles` table |
| 108 | Style emulation wired into all AI actions | todo | RAG over pgvector (enable extension at Phase 2 start) |
| 109 | Local AI toggles (grammar nudges, etc.) | todo | Per-capability switches in settings |
| 110 | Mastra evals for coaching quality | todo | Scorers, not vibes |

---

## Phase 3 â€” Research & Citations (Days 13â€“18)
*Reference: `src/imports/sartiarum-details/phase-3-research-and-citations.md`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 111 | Exa + Firecrawl as Mastra tools | todo | Search â†’ fetch â†’ clean pipeline |
| 112 | Trigger.dev research task + Realtime progress UI | todo | Live checklist: Gathering â†’ N found â†’ Deep research â†’ Writing |
| 113 | Source cards + Verified logic | todo | Retrieved & parsed = Verified (tooltip clarifies) |
| 114 | pgvector embedding + grounded generation | todo | |
| 115 | Citation insertion + style switching (APA first) | todo | |
| 116 | Upload-your-own-sources (PDF â†’ Supabase Storage â†’ parse) | todo | |

---

## Phase 4 â€” Learning Map (Days 19â€“24)
*Reference: `src/imports/sartiarum-details/phase-4-learning-map.md`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 117 | `/app/learn` surface + niche picker | todo | |
| 118 | Learning map (skill tree, lock states per node) | todo | |
| 119 | Lesson view + comprehension checks | todo | |
| 120 | Checkpoint tests + section gating | todo | |
| 121 | Practice editor + AI lesson-grounded review | todo | Reuse Phase 2 coaching UI |
| 122 | Gamification (XP, streaks w/ freeze, daily goal separate from streak) | todo | Escape hatches required |
| 123 | Author ONE niche end-to-end (e.g. copywriting) | todo | Engineering done; content is separate creative work |

---

## Phase 5 â€” Content Planner + Hardening (Days 25â€“28)
*Reference: `src/imports/sartiarum-details/phase-5-content-planner.md`*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 124 | `/app/plan` calendar + list view + drag-and-drop | todo | |
| 125 | Content pillars manager | todo | |
| 126 | Daily brief Trigger.dev task (drip + evidence) | todo | Reuses Phase 3 research engine |
| 127 | "Develop into draft" â†’ pre-filled Writer | todo | |
| 128 | Upstash rate limits enforced on ALL AI surfaces | todo | Every route, not just write |
| 129 | Version compaction scheduled task | todo | Never delete the latest version |
| 130 | Observability dashboards (Sentry / PostHog / Mastra evals) | todo | |
| 131 | Full regression pass â€” all prior acceptance criteria | todo | Phase is done only when all pass |



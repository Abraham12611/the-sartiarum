# Sartiarum — Project Guidelines

## Source of truth
- All product decisions, feature specs, data models, and build plans live in `src/imports/sartiarum-details/`. Always read the relevant file(s) before writing any code or forming a plan.
- Key files at a glance:
  - `build-phases-overview.md` — master phase plan (5 phases, 28 days)
  - `phase-1-core-writing-workspace.md` — Phase 1 spec (current priority)
  - `phase-1-build-kickoff.md` — Day 1 scaffolding, starter code, folder structure
  - `phase-2-coaching-and-voice.md` — Phase 2 spec
  - `phase-3-research-and-citations.md` — Phase 3 spec
  - `phase-4-learning-map.md` — Phase 4 spec
  - `phase-5-content-planner.md` — Phase 5 spec
  - `sartiarum-tech-stack.md` — full technology decisions and rationale
  - `sitemap (1).md` — every route, its shell, and which phase it ships in
  - `wireframe-spec.md` — screen-by-screen wireframes for all surfaces
  - `note-editor-wireframe-spec.md` — detailed editor wireframe (source of truth for the Writer screen)
  - `compass_artifact_wf-7e6cad8f-...md` — competitive research (Jenni AI, Eden, Duolingo, Codecademy)

## Workflow rules
- **Always plan before coding.** Before writing any code, produce a step-by-step plan and ask for confirmation. Only write code after the plan is approved.
- **Track all work in `TASKS.md`.** Every task must be logged there with a status: `todo`, `in-progress`, or `done`. Update the file as work progresses. Never start a coding session without reading and updating `TASKS.md` first.

## Git workflow (mandatory)

**Never push code directly to `main` or `develop`.** Every change goes through a feature branch -> PR -> `develop`. Only the repository owner merges `develop` -> `main` manually when a release is ready.

### Branch model
| Branch | Purpose | Who merges into it |
|--------|----------|-------------------|
| `main` | Production. Always deployable. | Owner only, manually from `develop` |
| `develop` | Integration branch. All PRs land here. | PRs from feature/fix branches |
| `feat/UNI-XXX-*` | New features | PR -> `develop` |
| `fix/UNI-XXX-*` | Bug fixes | PR -> `develop` |
| `chore/UNI-XXX-*` | Maintenance, sync, housekeeping | PR -> `develop` |

### Branch naming
- Features: `feat/UNI-XXX-short-description`
- Bug fixes: `fix/UNI-XXX-short-description`
- Maintenance: `chore/UNI-XXX-short-description`

### Step-by-step workflow
1. **Start from `develop`** - always sync before branching:
   ```
   git checkout develop
   git pull origin develop
   ```
2. **Create a task branch** from `develop`:
   ```
   git checkout -b feat/UNI-XXX-description
   ```
3. **Commit with structured messages:**
   ```
   <type>(<scope>): <subject>

   Closes UNI-XXX
   ```
   Types: `feat` - `fix` - `chore` - `docs` - `refactor` - `test`
4. **Push the branch** to origin:
   ```
   git push origin feat/UNI-XXX-description
   ```
5. **Open a PR into `develop`** - NEVER into `main`. No exceptions.
6. The PR is reviewed and merged manually by the owner - do not self-merge.
7. **`develop` -> `main`** is done manually by the owner only, at release time.
8. Before starting a new task, always return to step 1 (checkout `develop`, pull, then branch).

### What to do if a hotfix is needed on `main`
Even urgent fixes follow the same path: branch from `develop`, fix, PR -> `develop`, then the owner fast-tracks the `develop` -> `main` merge. Never bypass `develop`.

## Code and architecture rules
- Follow the tech stack exactly as defined in `sartiarum-tech-stack.md`. Do not introduce libraries not listed there without explicit approval.
- The folder structure from `phase-1-build-kickoff.md` §2 is the canonical layout. Place every new file in the correct directory.
- Starter code patterns in `phase-1-build-kickoff.md` §5 are the reference implementation — follow them for auth clients, Drizzle, AI routes, and server actions.
- RLS is always on. Server actions using Drizzle must always filter by `ownerId`; never rely on RLS alone for Drizzle queries (see §6 of the kickoff doc).
- AI routes always: (1) verify the user, (2) check entitlement, (3) stream, (4) log to `ai_usage`.
- Autocomplete uses `MODELS.fast`; all other AI actions use `MODELS.standard`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Domain routing rule: marketing/landing lives on `www.sartiarum.com`, app lives on `app.sartiarum.com`. On the app domain, unauthenticated users go to `/login`; authenticated users go to `/app`.

## Design rules
- Visual language: near-white canvas, light gray borders, near-black text, one green primary action, generous whitespace, rounded cards. Dark mode tokens must be defined from the start.
- The Writer has two shells: **▣ Dashboard shell** (sidebar) and **▢ Focus shell** (no sidebar, Back to Dashboard button). See `wireframe-spec.md` §0.
- Build the Writer's Assistant column shell in Phase 1 so Phase 2 (Coach) and Phase 3 (Research) content slots in with zero relayout.
- State coverage required for every data surface: Loading (skeletons), Empty (illustration + CTA), Error (inline + retry), Streaming (shimmer + Stop), Locked/Paywall (soft wall), Saving (passive indicator). See `wireframe-spec.md` §0.4 and the state matrix in §15.

## Phase discipline
- Ship phases in order. Do not build Phase 2+ features into Phase 1 code.
- Each phase has a cut line in its spec file. If behind schedule, drop cut-line items in order — never cut the items marked "never cut."
- A phase is done only when: acceptance criteria pass, the activation event fires in PostHog, it is deployed behind a feature flag, and no prior phase acceptance criteria are broken.

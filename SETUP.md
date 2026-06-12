# Sartiarum — Setup Guide

## 1. Clone & install

```bash
git clone https://github.com/Abraham12611/the-sartiarum.git
cd the-sartiarum
pnpm install
```

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

## 3. Public assets — background images

The auth pages use doodle illustration backgrounds stored locally.
Copy these files from the Figma Make project into `public/`:

| Source (Figma Make) | Destination |
|---|---|
| `src/imports/login-page-bg.png` | `public/login-bg.png` |
| `src/imports/signup-page-bg.png` | `public/signup-bg.png` |

The logo (`public/logo.png`) is already committed to the repo.

## 4. Supabase

- Schema is already applied via the Supabase MCP.
- Enable **Email** and **Google** providers in Supabase Dashboard → Authentication → Providers.
- Set the redirect URL to `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).

## 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

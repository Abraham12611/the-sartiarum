# Tiptap Notion-like Pro Setup

This project already supports editor mode switching:
- `Notion` (default, minimal)
- `Classic` (existing toolbar layout)

To install the official Tiptap Notion-like Pro template, complete these steps.

## 1) Authenticate Tiptap CLI locally

Run in the repo root:

```bash
npx @tiptap/cli@latest login
```

Use your Tiptap Cloud account credentials when prompted.

## 2) Install the Notion-like template

```bash
npx @tiptap/cli@latest add notion-like-editor
```

## 3) Configure environment variables

Set these in Vercel (Preview + Production):

- `NEXT_PUBLIC_TIPTAP_COLLAB_DOC_PREFIX`
- `NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID`
- `NEXT_PUBLIC_TIPTAP_AI_APP_ID`
- `TIPTAP_COLLAB_TOKEN`
- `TIPTAP_AI_TOKEN`

See `.env.example` for the full list.

## 4) Wire server-side JWT issuance (required for production)

Do not keep static long-lived tokens in the browser. Use server-generated JWT per request/session.

Suggested approach:
- Add a server endpoint that validates the signed-in user.
- Mint short-lived Tiptap token(s).
- Return token to client editor bootstrapping code.

## 5) Keep fallback path

Keep `Classic` mode available as a fallback while Pro setup is being validated in preview deployments.

## Notes

- The Tiptap Notion-like template is a Pro template and requires authenticated CLI access.
- Runtime env vars alone are not enough to download template source code; CLI auth is mandatory.

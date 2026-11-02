# Metro Visual Studio

A visual website editor connected to Supabase, built with Next.js, React and Tailwind CSS. This replaces the previous single HTML page while preserving it in Git history.

## Features

- Select text, links, images, videos or layout containers in the canvas or layers tree.
- Edit content, typography, colours, spacing, borders, shadows, sizing and flex/grid layouts.
- Add, reorder, duplicate, hide and delete elements, with undo/redo.
- Desktop/tablet/mobile previews and separate mobile style overrides.
- Editable announcement popups, with fade/slide/zoom effects, placement and timing controls. Test popups retain their Sample preview label.
- Durable drafts, transactional publishing, version history, restoration and HTML/JSON export.
- Midnight Cherry Red and Quicksilver styling across the editor and saved site.
- Visitor language switching, editable translations, English fallback and right-to-left Arabic. French and Spanish sample labels are included.
- Optional automatic translation of missing text using the desktop Chrome Translator API; browser/language support varies. The first use may download language files. Manual translations work in other browsers.
- Private image/video uploads to Supabase Storage.

## Run locally

Use Node.js 22.13+.

```sh
npm ci
npm run dev
```

Set `STUDIO_BACKEND_URL` and `STUDIO_BACKEND_TOKEN` in an untracked `.env.local`. Production values belong in Vercel's encrypted environment settings. Never expose the token through a public environment-variable prefix or commit it.

```sh
npm run check
npm run build
```

## Routes

- `/`: editor
- `/site`: published website (for example, `/site?lang=fr`)
- `/api/document`: saved pages, publishing and versions
- `/api/assets`: uploads and media delivery
- `/api/backend`: backend health check

## Backend and access

The Supabase project is `olnkypwqreonuweulylk`. Documents use `metro_studio_documents`; files use the private `metro-studio-media` bucket. The authenticated `metro-studio-backend` Edge Function serves only this editor's site records. Its source contains token digests, never plaintext tokens.

The existing Vercel project's deployment protection remains the access boundary for this private editor and its API. Keep that protection enabled. A public launch with a private editor requires separate application-level authentication/authorisation before removing deployment protection or adding an unprotected custom domain.

The editor shares the existing Supabase page records with the original private preview. Publishing in either deployment updates that same saved website. Existing files and source versions are retained in Git history; do not overwrite the Supabase schema or redeploy its function without preserving active deployment-token digests.

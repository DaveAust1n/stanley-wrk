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

- `/`: published website
- `/editor`: visual editor (existing deployment protection remains in force)
- `/site`: published website (for example, `/site?lang=fr`)
- `/api/document`: saved pages, publishing and versions
- `/api/assets`: uploads and media delivery
- `/api/backend`: backend health check

## Backend and access

The Supabase project is `olnkypwqreonuweulylk`. Documents use `metro_studio_documents`; files use the private `metro-studio-media` bucket. The authenticated `metro-studio-backend` Edge Function serves only this editor's site records. Its source contains token digests, never plaintext tokens.

The existing Vercel project's deployment protection remains the access boundary for this private editor and its API. Keep that protection enabled. A public launch with a private editor requires separate application-level authentication/authorisation before removing deployment protection or adding an unprotected custom domain.

The editor shares the existing Supabase page records with the original private preview. Publishing in either deployment updates that same saved website. Existing files and source versions are retained in Git history; do not overwrite the Supabase schema or redeploy its function without preserving active deployment-token digests.

## Editable page templates

- Home navigation keeps section links for Overview, Stories, Process and Collection. Explore now opens `/order`. Collection cards pass their vehicle ID to that form.
- `/order` creates an order after reviewing published vehicle and delivery prices; Continue opens its `/payment?order=ORD-…` checkout. `/track` looks up actual order/payment/delivery status. Embedded editor previews never submit orders or payments.
- In `/editor`, use **Editing page** to switch between Home, Vehicle form & summary, Checkout and Tracking. Vehicles & prices controls the form and summary wording; Page templates controls checkout/tracking text. Save draft keeps edits private; Publish updates the pages. Blank content stays blank.

## Payment administration

Open `/admin`, or Website editor → Site settings → Payment administration. Sign in with an admin code already accepted by `checkout-backend`. The code is checked by the backend and stored only inside an encrypted, HttpOnly, SameSite=Strict session cookie that expires after 30 minutes. Sign out clears it. No admin codes are embedded in the browser bundle.

The workspace filters submitted, awaiting, confirmed, rejected and expired payments, searches order/customer/transaction details, and shows the receiving wallet, expected amount and quote times. Confirmation requires an explicit receipt-verification acknowledgement; rejection requires a reason. Paid orders allow delivery-status updates. This is manual review; the screen does not verify blockchain receipt automatically. Customer checkout submits transactions to this review queue; only an administrator verifying actual receipt may confirm payment.

Server environment: `CHECKOUT_BACKEND_URL`, `CHECKOUT_BACKEND_TOKEN`, `ADMIN_SESSION_SECRET` (at least 32 random characters). The server token must match an allowed digest in the deployed Edge Function. Existing backend tokens and human admin-code digests must be retained during deployment. Keep Vercel deployment protection enabled.

Admin endpoints:
- `POST /api/admin/session` — `{code}`; validates the existing code and establishes a session.
- `DELETE /api/admin/session` — signs out.
- `GET /api/admin/payments?status=submitted` — protected payment list.
- `GET /api/admin/orders/ORD-…` — protected order and delivery details.
- `POST /api/admin/payments/{id}/confirm` — `{verifiedReceipt:true,note?}`.
- `POST /api/admin/payments/{id}/reject` — `{note}`.
- `POST /api/admin/orders/{code}/fulfilment` — `{status,note?}`.

State-changing requests require a matching Origin. Responses are never cached. Each backend call checks the admin code again, so removing its allowed digest revokes access even before cookie expiry. API routes proxy only the explicit allowlist.

Validation: `node --experimental-strip-types --test scripts/verify-admin.mjs`, `npm run check`, `npm run build`, then `node scripts/verify-admin-integration.mjs` (isolated mock backend only).

The Edge Function’s existing credential verifiers remain on Supabase. `scripts/fixtures/checkout-backend.txt` is the deployed code snapshot with all allowed digests removed, used only for isolated authorization tests. Preserve the live allowlists when updating the function; do not deploy the test fixture.

## Customer checkout

Customers select a vehicle, enter delivery details, review the total and save their order. The server reads **published** editor settings to compute each USD line item; it rejects missing prices, altered client amounts and stale totals. A stale total returns updated settings for a second review. Set vehicle prices, the base delivery fee and each available delivery option in **Vehicles & prices**, then Publish. No placeholder prices are charged.

Payment methods come from active backend wallets. The customer requests a quote, sees the backend amount, wallet, network, exchange rate, expiry and DOGE payment QR, then submits a transaction hash. Submission means pending manual review, never confirmed receipt. Expired quotes hide payment instructions; a hash for an already-sent transaction can still be submitted for review. Paid orders expose their tracking reference. Tracking shows only limited order/payment/delivery status, without customer contact or address details.

Server environment additionally requires `CUSTOMER_SESSION_SECRET`, a separate random secret of at least 32 characters. Private payment instructions require an encrypted HttpOnly, SameSite=Strict cookie belonging to the browser that created the order, valid for 24 hours and keeping the latest 12 orders. Order/tracking references work on the public tracking form across devices. The server bridge token and Supabase credentials never enter client bundles. Same-browser retries with the same request ID and unchanged details reuse the latest saved order; this is not database-level idempotency across concurrent requests.

Customer endpoints:

- `GET /api/checkout/status`: backend connectivity and whether payable prices have been published.
- `POST /api/checkout/orders`: selected IDs, customer details, locale, request ID and expected total; server supplies trusted prices and names.
- `GET /api/checkout/orders/{code}`: requires the creating browser's sealed session.
- `POST /api/checkout/orders/{code}/payments`: currency/network quote request.
- `POST /api/checkout/orders/{code}/payments/{id}/tx`: transaction hash for manual review.
- `GET /api/checkout/track/{ORD-or-TRK-reference}`: limited public tracking result.

Validation: `node --test scripts/verify-customer.mjs`, `npm run check`, `npm run build`, then `node scripts/verify-customer-integration.mjs`. The integration test uses a separate in-memory backend and does not create or approve production orders. `CUSTOMER_BROWSER_TEST=1 node scripts/verify-customer-integration.mjs` leaves the isolated test server running on port 3000 for local browser checks. Stop it after testing. Confirm live quote availability and actual receipt with a controlled transaction after business prices are published.

## Comment feeds

The two original empty video placeholders render as owner-managed comment feeds. Existing videos with uploaded/linked sources stay intact. Open `/editor?panel=comments` or the **Comments** tool, select a section and add entries. Each entry supports a circular profile photo (upload or URL), name, text, recorded like count, optional date/time label and visibility. Reorder or remove entries with the card controls. Photos fall back to initials. Empty names/messages are excluded from the published feed. Content is shared across languages, as entered.

Save draft and Publish retain their existing behavior. Likes and date labels are editorial values supplied by the owner; this is not a live visitor-posting or reaction service. No activity, people or timestamps are generated. The same renderer is used for editor previews, the published page and HTML export. **Add elements → Comment feed** inserts another section.

Validation: `node --test scripts/verify-comments.mjs`, `npm run check`, `npm run build`, then `node scripts/verify-comments-integration.mjs` for draft/save/publish verification against a separate in-memory backend.

## Live social embeds

Open `/editor?panel=social` or **Social links**. Paste a public URL into any of the three cards; the canvas updates immediately. **Preview** enables player interaction. Save draft stores edits privately; Publish updates the website. The original card link is retained and synchronized. Existing comments, payment flows and other page content remain unchanged.

Supported content: YouTube videos/Shorts/live-video URLs/playlists, public Instagram posts/Reels/embeddable profiles, TikTok full video URLs, public Facebook posts/Reels and Threads posts. YouTube channel links and other unsupported social URL forms retain an Open original link. Generic HTTPS websites are shown in a sandboxed frame with an external fallback; sites can prohibit embedding through their own security headers. No client credentials or arbitrary embed-code pasting are needed.

Meta embeds use the fixed official tokenless oEmbed endpoints plus the relevant official frontend script, inside a sandbox without same-origin access. Instagram has a standard embed-script fallback when metadata is unavailable. No arbitrary server-side URL fetching occurs. Exported HTML uses this deployment's public embed endpoint for Meta content, so it requires the deployed service to remain available. Profile embeds show the content the platform exposes; this does not scrape an account's entire feed.

Validation: `node --test scripts/verify-social.mjs`, `npm run check`, `npm run build`, `node scripts/verify-comments-integration.mjs`. No test links or content are written to production documents.

# Android / Capacitor preparation

GrowthPilot is built as a responsive Next.js web app with JSON APIs so it can be wrapped later with [Capacitor](https://capacitorjs.com/) without rewriting the backend.

## Current mobile-ready pieces

- Responsive dashboard sidebar (sheet on small screens)
- Touch-friendly forms and report layouts
- Cookie-based Supabase auth (same as web)
- REST endpoints under `/api/*` for audits, chat, and clients

## Recommended Capacitor setup (when you are ready)

1. Deploy the app to Vercel and set `NEXT_PUBLIC_APP_URL` to the production URL.
2. In a separate branch, add Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "GrowthPilot AI" com.growthpilot.app --web-dir=out
```

3. For a **hosted WebView** (simplest): point Capacitor `server.url` to your Vercel deployment instead of bundling static files. Users always get the latest web app.

4. For a **bundled hybrid** app, export a static shell or use a minimal WebView that loads your deployed URL.

5. Add Android assets:
   - App icon: `android/app/src/main/res/mipmap-*`
   - Splash: Capacitor Splash Screen plugin

6. Configure deep links for auth:
   - Supabase redirect URL: `com.growthpilot.app://auth/callback`
   - Match in Supabase **Authentication → URL configuration**

## API usage from native shell

Authenticate with Supabase mobile SDK or WebView session, then call:

- `POST /api/audits` — run audit
- `GET /api/audits/:id` — fetch report
- `GET/POST /api/audits/:id/chat` — consultant

Pass the Supabase session cookie or migrate to Bearer token auth if you add a dedicated mobile auth layer later.

## UI checklist before store submission

- Test sidebar, report charts, and PDF download on 360px width
- Verify login/signup keyboard behavior
- Confirm offline/error states on slow networks
- Replace marketing demo links with production URLs

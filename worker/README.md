# PhysicsLab Feedback Worker

A small Cloudflare Worker + D1 database that collects feedback submitted from the PhysicsLab feedback form. Deployed independently of the main site (which stays a static GitHub Pages build).

- **Public endpoint:** `POST /api/feedback` — `{ message: string, email?: string }`
- **Admin endpoint:** `GET /api/feedback` — requires `Authorization: Bearer <ADMIN_TOKEN>`
- **Admin page:** `/admin` — enter the admin token in the browser to view submissions in a table

Live at: https://physicslab-feedback.ztang017.workers.dev

## Local development

```bash
npm install
npm run dev
```

## Deploying changes

```bash
npm run deploy
```

## Database

Schema lives in `schema.sql`. To re-apply it (e.g. after editing it):

```bash
npm run db:migrate:remote
```

To query the database directly instead of using `/admin`:

```bash
npx wrangler d1 execute physicslab-feedback --remote --command="SELECT * FROM feedback ORDER BY created_at DESC"
```

## Rotating the admin token

The admin token is stored as a Worker secret, not in this repo. To set or change it:

```bash
npx wrangler secret put ADMIN_TOKEN
```

(paste a new random token when prompted, then use that value on the `/admin` page going forward)

## CORS

Allowed origins are set via the `ALLOWED_ORIGINS` var in `wrangler.jsonc` (comma-separated). Add any new domain the frontend is served from there and redeploy.

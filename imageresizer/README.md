# Smart Image Resizer

Modern full-stack image processing SaaS built with React, Vite, Tailwind CSS, Express, Sharp, JWT auth, and Supabase.

## Features

- Email/password signup, login, logout, forgot password, email verification support, Google OAuth through Supabase.
- JWT protected Express API with rate limiting, CORS, Helmet, file validation, and Supabase service integration.
- Drag and drop multi-image uploads with progress, JPG/PNG/WEBP validation, and 12MB file limit.
- Resize by width, height, percentage, social presets, aspect option, crop mode, compression quality, conversion, watermark text, and batch processing.
- Original and processed previews, file size comparison, resolution comparison, cloud history, downloads, delete actions.
- User dashboard with image counts, processed history, profile, and storage usage.
- Admin dashboard with users, uploads moderation, download count, and total storage usage.
- Responsive modern SaaS UI with glass panels, dark/light mode, animations, skeleton states, and toast notifications.

## Project Structure

```text
src/
  components/ pages/ layouts/ hooks/ services/ utils/ context/ routes/ styles/
server/
  controllers/ routes/ middleware/ services/ utils/ uploads/ config/
supabase/
  schema.sql
```

## Environment

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:5000/api
```

Create `server/.env`:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLIENT_URL=http://localhost:5173
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication, enable Email provider and Google provider.
4. Add OAuth redirect URLs:
   - `http://localhost:5173/dashboard`
   - your Vercel production dashboard URL
5. The SQL creates a public `images` bucket with folder-scoped RLS policies. The Express server uses the service role key for processing uploads.
6. To make an admin:

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

## Local Development

Install root frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

Run the API:

```bash
npm run dev
```

Run the frontend from the project root:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:5000`.

## API

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/supabase`
- `GET /api/auth/me`

Images:

- `POST /api/images/upload`
- `POST /api/images/resize`
- `POST /api/images/compress`
- `POST /api/images/convert`
- `GET /api/images/history`
- `POST /api/images/:id/download`
- `DELETE /api/images/:id`

Admin:

- `GET /api/admin/users`
- `GET /api/admin/uploads`
- `GET /api/admin/stats`

## Deployment

Frontend on Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.

Backend on Render or Railway:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Set `PORT`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and production `CLIENT_URL`.

Supabase:

- Run the schema before first deploy.
- Add the Vercel URL to Supabase Auth redirect URLs.
- Keep the service role key only on the backend.

## Notes

AI enhancement and background remover controls are included as roadmap placeholders in the UI. The core production image operations are handled by Sharp on the backend.

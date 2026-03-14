This is the frontend for the Speech-to-Text app. It is integrated with the Flask backend via a Next.js `/api/*` proxy.

## Getting Started

1. Configure backend URL for proxy:

```bash
cp .env.local.example .env.local
```

`BACKEND_URL` defaults to `http://localhost:5000`.
Set Supabase frontend auth variables too:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Start backend (from `backend/`):

```bash
.\venv\Scripts\python app.py
```

3. Start frontend (from `frontend/`):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Frontend on Vercel

Set these environment variables in Vercel:

- `BACKEND_URL=https://your-render-service.onrender.com`
- `NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`

Build settings:

- Framework Preset: `Next.js`
- Root Directory: `frontend`

### Backend on Render

Use the config in [render.yaml](e:\speech-to-text\backend\render.yaml) or create a Python Web Service manually with:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

Set these environment variables in Render:

- `DEEPGRAM_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`
- `PORT` is provided by Render automatically

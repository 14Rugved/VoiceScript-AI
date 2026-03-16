# VoiceScript AI

VoiceScript AI is a full-stack speech-to-text web application that lets users record or upload audio, transcribe it with Deepgram, and store transcript history in Supabase.

The project uses:

- `Next.js` for the frontend
- `Flask` for the backend API
- `Supabase Auth` for authentication
- `Supabase Database + Storage` for transcript and audio persistence
- `Deepgram` for audio transcription

## Features

- User authentication with Supabase
- Audio recording from browser microphone
- Audio file upload support
- Deepgram transcription with keyword/name hints
- Transcript history per user
- Full transcript viewing from history
- Audio file storage in Supabase
- Frontend deployment on Vercel
- Backend deployment on Render

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase JS SDK

### Backend

- Flask
- Python
- Requests
- Supabase Python SDK
- Flask-CORS

### Services

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Deepgram API
- Vercel
- Render

## Project Structure

```text
speech-to-text/
├── backend/
│   ├── app.py
│   ├── supabase_client.py
│   ├── supabase_auth_setup.sql
│   ├── requirements.txt
│   └── render.yaml
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── next.config.ts
└── .gitignore
```

## How It Works

1. The user signs in using Supabase Auth.
2. The frontend records audio or accepts an uploaded file.
3. The frontend sends the audio to the Flask backend.
4. The backend verifies the user JWT.
5. The backend sends the audio to Deepgram for transcription.
6. The backend uploads the original audio to Supabase Storage.
7. The backend saves transcript text, filename, audio URL, and `user_id` in Supabase.
8. The frontend fetches transcript history and shows only the signed-in user's records.

## Authentication and Authorization

This project uses JWT-based authentication via Supabase Auth.

- The frontend receives a Supabase access token after login.
- API requests send the token as a bearer token.
- The backend verifies the token using Supabase.
- Transcript rows are associated with a `user_id`.
- Supabase Row Level Security ensures users can only access their own transcripts.

## Environment Variables

### Frontend

Create `frontend/.env` for local development:

```env
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend

Create `backend/.env`:

```env
DEEPGRAM_API_KEY=your_deepgram_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

Backend runs at:

```text
http://localhost:5000
```

## Supabase Setup

You must create a `transcripts` table and enable row-level security.

Run the SQL in:

[`backend/supabase_auth_setup.sql`](./backend/supabase_auth_setup.sql)

This:

- adds the `user_id` column
- enables RLS
- creates policies so users can only read, insert, and delete their own transcripts

## Deployment

### Frontend on Vercel

Configure:

- Root Directory: `frontend`
- Framework Preset: `Next.js`

Environment variables:

- `BACKEND_URL=https://your-render-backend.onrender.com`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

### Backend on Render

Create a `Web Service` with:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

Environment variables:

- `DEEPGRAM_API_KEY=...`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`

## Security Notes

- Never commit real `.env` files
- Keep `SUPABASE_SERVICE_ROLE_KEY` only on the backend
- Use Supabase RLS for per-user access control
- Rotate secrets if exposed
- Consider using private storage + signed URLs for stronger audio privacy

## Known Limitations

- Current transcription is request-based, not real-time streaming
- Public audio URLs may not be ideal for highly sensitive recordings
- Old transcripts created before `user_id` support may need manual migration

## Future Improvements

- Real-time streaming transcription
- Private storage with signed URLs
- Better rate limiting and abuse protection
- Transcript search and filtering
- Transcript export
- Speaker diarization
- Better formatting and summarization

## License

Add your preferred license here.

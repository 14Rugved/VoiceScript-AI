# VoiceScript AI

<p align="center">
  A full-stack speech-to-text platform for recording, uploading, transcribing, and managing personal transcript history.
</p>

<p align="center">
  <a href="https://voicescript-ai.vercel.app/login"><strong>Live Demo</strong></a>
</p>

<p align="center">
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-Next.js-111111?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="Backend" src="https://img.shields.io/badge/Backend-Flask-1f2937?style=for-the-badge&logo=flask&logoColor=white">
  <img alt="Database" src="https://img.shields.io/badge/Database-Supabase-0f766e?style=for-the-badge&logo=supabase&logoColor=white">
  <img alt="Speech" src="https://img.shields.io/badge/Speech-Deepgram-2563eb?style=for-the-badge">
</p>

## Overview

VoiceScript AI is a full-stack speech-to-text web application that lets users:

- sign in securely
- record audio directly from the browser
- upload audio files manually
- transcribe speech using Deepgram
- store transcripts and audio metadata in Supabase
- review complete transcript history per user

This project was built with a split deployment model:

- `frontend` deployed on Vercel
- `backend` deployed on Render

## Live App

- Production URL: [https://voicescript-ai.vercel.app/login](https://voicescript-ai.vercel.app/login)

## Features

- Supabase authentication with protected routes
- JWT-secured backend API access
- Browser microphone recording
- Audio file upload support
- Deepgram-powered transcription
- Name and keyword hints for improved recognition
- Per-user transcript history
- Full transcript viewing from history
- Audio upload and persistence with Supabase Storage
- Separate frontend/backend deployments

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
- Flask-CORS
- Supabase Python SDK

### Services

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Deepgram API
- Vercel
- Render

## Architecture

```text
Browser
   |
   v
Next.js Frontend (Vercel)
   |
   v
Flask Backend (Render)
   |
   +--> Deepgram API
   |
   +--> Supabase Auth
   |
   +--> Supabase Database
   |
   +--> Supabase Storage
```

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
4. The backend verifies the JWT from the `Authorization` header.
5. The backend sends the audio to Deepgram for transcription.
6. The backend uploads the original audio to Supabase Storage.
7. The backend saves transcript text, filename, audio URL, and `user_id` in Supabase.
8. The frontend fetches transcript history and shows only the logged-in user's records.

## Authentication and Authorization

This project uses JWT-based authentication with Supabase Auth.

- The frontend receives a Supabase access token after login.
- API requests send the token as a bearer token.
- The backend verifies the token using Supabase.
- Each transcript is linked to a `user_id`.
- Supabase RLS policies ensure users can only read, insert, and delete their own transcripts.

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

Configuration:

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
- Consider private storage with signed URLs if transcript audio must stay non-public

## Known Limitations

- Transcription is request-based, not real-time streaming
- Public audio URLs may not be ideal for highly sensitive recordings
- Older transcripts created before `user_id` support may need manual reassignment

## Future Improvements

- Real-time streaming transcription
- Private storage with signed URLs
- Rate limiting and abuse protection
- Better search and filtering
- Transcript export
- Speaker diarization
- Better formatting and summarization

## License

Add your preferred license here.

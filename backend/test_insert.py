from supabase_client import supabase

data = {
    "text": "test transcript",
    "filename": "test_audio_1.mp3",
    "user_id": "REPLACE_WITH_AUTH_USER_ID",
}

response = supabase.table("transcripts").insert(data).execute()

print(response)

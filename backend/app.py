import os
from uuid import uuid4
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from postgrest.exceptions import APIError as PostgrestAPIError
from storage3.exceptions import StorageApiError
from supabase_client import supabase

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3001")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [FRONTEND_URL, "http://localhost:3001"]}})


def get_authenticated_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, (jsonify({"error": "Missing bearer token"}), 401)

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None, (jsonify({"error": "Missing bearer token"}), 401)

    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None)
        if not user:
            return None, (jsonify({"error": "Invalid or expired token"}), 401)
        return user, None
    except Exception as exc:
        return None, (jsonify({"error": "Authentication failed", "details": str(exc)}), 401)


@app.route("/transcribe", methods=["POST"])
def transcribe():
    user, auth_error = get_authenticated_user()
    if auth_error:
        return auth_error

    file = request.files.get("file")
    keyterms_raw = request.form.get("keyterms", "")
    keyterms = [term.strip() for term in keyterms_raw.split(",") if term.strip()]

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = file.filename or "recording.webm"
    file_path = f"temp_{uuid4().hex}_{filename}"

    file.save(file_path)

    try:
        if not DEEPGRAM_API_KEY:
            return jsonify({"error": "Missing DEEPGRAM_API_KEY"}), 500

        # Read audio file
        with open(file_path, "rb") as audio_file:
            audio_data = audio_file.read()

        # Send to Deepgram
        deepgram_params = [
            ("model", "nova-3"),
            ("smart_format", "true"),
        ]
        for term in keyterms[:25]:
            deepgram_params.append(("keyterm", term))

        dg_response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers={
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": file.content_type
            },
            params=deepgram_params,
            data=audio_data
        )
        dg_response.raise_for_status()

        dg_data = dg_response.json()

        transcript = (
            dg_data.get("results", {})
            .get("channels", [{}])[0]
            .get("alternatives", [{}])[0]
            .get("transcript", "")
        )

        # Upload to Supabase Storage
        _, ext = os.path.splitext(filename)
        safe_ext = ext if ext else ".webm"
        stored_filename = f"{uuid4().hex}{safe_ext}"
        storage_path = f"recordings/{stored_filename}"

        with open(file_path, "rb") as f:
            supabase.storage.from_("recordings").upload(storage_path, f)

        public_url_result = supabase.storage.from_("recordings").get_public_url(storage_path)
        audio_url = (
            public_url_result.get("publicUrl")
            if isinstance(public_url_result, dict)
            else public_url_result
        )

        # Save transcript in database
        record = {
            "text": transcript,
            "filename": filename,
            "audio_url": audio_url,
            "user_id": user.id,
        }

        supabase.table("transcripts").insert(record).execute()

        return jsonify({
            "transcript": transcript,
            "audio_url": audio_url
        })

    except StorageApiError as e:
        return jsonify({
            "error": "Storage upload failed",
            "details": str(e),
            "hint": "Use SUPABASE_SERVICE_ROLE_KEY in backend, or add INSERT policy on storage.objects for this bucket."
        }), 500

    except PostgrestAPIError as e:
        return jsonify({
            "error": "Database insert failed",
            "details": str(e)
        }), 500

    except requests.RequestException as e:
        return jsonify({
            "error": "Deepgram request failed",
            "details": str(e)
        }), 500

    except Exception as e:

        return jsonify({
            "error": "Transcription failed",
            "details": str(e)
        }), 500

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@app.route("/transcripts", methods=["GET"])
def get_transcripts():
    user, auth_error = get_authenticated_user()
    if auth_error:
        return auth_error

    response = supabase.table("transcripts") \
        .select("*") \
        .eq("user_id", user.id) \
        .order("created_at", desc=True) \
        .execute()

    return jsonify(response.data)


@app.route("/transcripts/<id>", methods=["DELETE"])
def delete_transcript(id):
    user, auth_error = get_authenticated_user()
    if auth_error:
        return auth_error

    supabase.table("transcripts").delete().eq("id", id).eq("user_id", user.id).execute()

    return jsonify({"message": "Transcript deleted"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")

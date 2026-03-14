import os
import base64
import json
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing Supabase config. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
        "(or SUPABASE_KEY)."
    )


def _extract_jwt_role(jwt_token: str) -> str:
    try:
        payload = jwt_token.split(".")[1]
        padded = payload + "=" * (-len(payload) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        return json.loads(decoded).get("role", "unknown")
    except Exception:
        return "unknown"


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabase URL:", SUPABASE_URL)
print("Supabase role:", _extract_jwt_role(SUPABASE_KEY))

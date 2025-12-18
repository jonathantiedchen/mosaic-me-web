"""In-memory storage for mosaic sessions."""
from typing import Dict, Optional
from datetime import datetime, timedelta
import threading

# In-memory storage
_sessions: Dict[str, Dict] = {}
_sessions_lock = threading.Lock()

# TTL for sessions (24 hours)
SESSION_TTL = timedelta(hours=24)


def save_mosaic_data(mosaic_data: Dict) -> None:
    """Save mosaic data to in-memory storage."""
    session_id = mosaic_data['sessionId']

    with _sessions_lock:
        _sessions[session_id] = {
            'data': mosaic_data,
            'created_at': datetime.utcnow()
        }


def get_mosaic_data(session_id: str) -> Optional[Dict]:
    """Retrieve mosaic data from storage."""
    with _sessions_lock:
        session = _sessions.get(session_id)

        if not session:
            return None

        # Check if session has expired
        if datetime.utcnow() - session['created_at'] > SESSION_TTL:
            del _sessions[session_id]
            return None

        return session['data']


def save_mosaic_preview(session_id: str, preview_url: str) -> None:
    """Update the preview URL for a mosaic."""
    with _sessions_lock:
        if session_id in _sessions:
            _sessions[session_id]['data']['previewUrl'] = preview_url


def cleanup_expired_sessions() -> int:
    """Remove expired sessions. Returns number of sessions removed."""
    removed_count = 0

    with _sessions_lock:
        expired_ids = []
        now = datetime.utcnow()

        for session_id, session in _sessions.items():
            if now - session['created_at'] > SESSION_TTL:
                expired_ids.append(session_id)

        for session_id in expired_ids:
            del _sessions[session_id]
            removed_count += 1

    return removed_count

#!/usr/bin/env python3
"""Generate a password hash using the backend's AuthService."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.auth import AuthService
from src.config import config

def main():
    """Generate password hash."""
    if len(sys.argv) < 2:
        print("Usage: python get_password_hash.py <password>")
        sys.exit(1)

    password = sys.argv[1]

    auth_service = AuthService(
        secret_key=config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM
    )

    password_hash = auth_service.hash_password(password)

    print()
    print("=" * 70)
    print("Password Hash Generated:")
    print("=" * 70)
    print(password_hash)
    print("=" * 70)
    print()

if __name__ == "__main__":
    main()

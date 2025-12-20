#!/usr/bin/env python3
"""Script to create an admin user."""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.db.database import SessionLocal
from src.db.models import Admin
from src.services.auth import AuthService
from src.config import config
from sqlalchemy import select


async def create_admin(email: str, password: str, full_name: str = None):
    """
    Create a new admin user.

    Args:
        email: Admin email address
        password: Admin password (will be hashed)
        full_name: Optional full name
    """
    auth_service = AuthService(
        secret_key=config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM
    )

    async with SessionLocal() as db:
        try:
            # Check if admin with this email already exists
            result = await db.execute(
                select(Admin).where(Admin.email == email)
            )
            existing_admin = result.scalar_one_or_none()

            if existing_admin:
                print(f"❌ Admin with email {email} already exists!")
                return False

            # Hash the password
            password_hash = auth_service.hash_password(password)

            # Create the admin
            admin = Admin(
                email=email,
                password_hash=password_hash,
                full_name=full_name,
                is_active=True
            )

            db.add(admin)
            await db.commit()
            await db.refresh(admin)

            print(f"✅ Admin user created successfully!")
            print(f"   Email: {admin.email}")
            print(f"   ID: {admin.id}")
            if admin.full_name:
                print(f"   Name: {admin.full_name}")
            print()
            print("You can now log in to the admin dashboard with these credentials.")
            return True

        except Exception as e:
            print(f"❌ Error creating admin: {e}")
            await db.rollback()
            return False


async def main():
    """Main entry point for the script."""
    print("=" * 60)
    print("Create Admin User")
    print("=" * 60)
    print()

    # Get admin details from user input
    email = input("Email address: ").strip()

    if not email:
        print("❌ Email is required!")
        sys.exit(1)

    full_name = input("Full name (optional): ").strip() or None

    password = input("Password: ").strip()

    if not password:
        print("❌ Password is required!")
        sys.exit(1)

    if len(password) < 8:
        print("❌ Password must be at least 8 characters long!")
        sys.exit(1)

    print()
    print("Creating admin user...")
    print()

    success = await create_admin(email, password, full_name)

    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)

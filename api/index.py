"""Vercel entrypoint: serves the FastAPI backend as a Python function.

vercel.json rewrites every /api/* request here; FastAPI still sees the
original path, so its /api/v1 routes match unchanged.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from src.main import app  # noqa: E402,F401

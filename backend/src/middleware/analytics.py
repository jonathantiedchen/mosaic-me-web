"""Analytics tracking middleware."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import hashlib
import uuid
import logging

logger = logging.getLogger(__name__)


class AnalyticsMiddleware(BaseHTTPMiddleware):
    """Middleware to track analytics events without storing personal data."""

    def __init__(self, app, analytics_service, db_session_factory, salt: str):
        """
        Initialize analytics middleware.

        Args:
            app: FastAPI application
            analytics_service: AnalyticsService instance
            db_session_factory: Database session factory
            salt: Salt for hashing visitor identifiers
        """
        super().__init__(app)
        self.analytics_service = analytics_service
        self.db_session_factory = db_session_factory
        self.salt = salt

    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Process each request and track analytics.

        Args:
            request: HTTP request
            call_next: Next middleware/endpoint

        Returns:
            HTTP response
        """
        # Generate privacy-preserving visitor hash
        visitor_hash = self._generate_visitor_hash(request)

        # Store visitor hash in request state for use in other endpoints
        request.state.visitor_hash = visitor_hash

        # Track page view for main routes (not for static assets or API endpoints)
        if request.url.path == "/" or request.url.path == "/index.html":
            try:
                async with self.db_session_factory() as db:
                    await self.analytics_service.track_event(
                        db=db,
                        event_type="page_view",
                        visitor_hash=visitor_hash
                    )
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Error tracking page view: {e}")

        # Process the request
        response = await call_next(request)

        return response

    def _generate_visitor_hash(self, request: Request) -> str:
        """
        Generate a privacy-preserving hash for visitor tracking.

        Uses session cookie if available, otherwise creates an identifier
        based on IP address and user agent for better uniqueness.

        Args:
            request: HTTP request

        Returns:
            SHA256 hash of the visitor identifier
        """
        # Try to get session ID from cookie
        session_id = request.cookies.get("session_id")

        if not session_id:
            # Generate a temporary identifier based on IP + user agent
            # This provides better uniqueness while still being privacy-preserving
            # The hash is one-way and salted, so IP cannot be recovered

            # Get IP address from headers (Railway sets X-Forwarded-For)
            ip_address = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
            if not ip_address:
                ip_address = request.client.host if request.client else "unknown"

            user_agent = request.headers.get("user-agent", "unknown")
            session_id = f"{ip_address}:{user_agent}"

        # Hash the session ID with salt to create a visitor hash
        hash_input = f"{session_id}{self.salt}"
        visitor_hash = hashlib.sha256(hash_input.encode()).hexdigest()

        return visitor_hash

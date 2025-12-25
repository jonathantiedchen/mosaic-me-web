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
        Generate a truly anonymous daily visitor hash for GDPR compliance.

        This creates a hash that:
        - Is unique per visitor per day (for daily unique visitor counts)
        - Changes every day (cannot track individuals across days)
        - Cannot be reversed to identify the person
        - Qualifies as truly anonymous data under GDPR

        The hash includes the current date, so the same person gets a
        different hash each day. This makes cross-day tracking impossible
        while still allowing accurate daily unique visitor counts.

        Args:
            request: HTTP request

        Returns:
            SHA256 hash of the daily visitor identifier
        """
        # Get IP address from headers (Railway sets X-Forwarded-For)
        ip_address = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        if not ip_address:
            ip_address = request.client.host if request.client else "unknown"

        user_agent = request.headers.get("user-agent", "unknown")

        # Get current date (YYYY-MM-DD) - this makes the hash change daily
        from datetime import datetime
        current_date = datetime.utcnow().strftime("%Y-%m-%d")

        # Create hash with date included - this rotates daily automatically
        # Same visitor = same hash today, different hash tomorrow
        # This makes it truly anonymous (cannot link behavior across days)
        hash_input = f"{ip_address}:{user_agent}:{current_date}:{self.salt}"
        visitor_hash = hashlib.sha256(hash_input.encode()).hexdigest()

        return visitor_hash

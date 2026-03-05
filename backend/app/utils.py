import logging
import sentry_sdk
from sentry_sdk.integrations.logging import BreadcrumbHandler, EventHandler
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(settings.PROJECT_NAME)

# Add Sentry handlers to our specific logger only
if settings.SENTRY_DSN:
    # Breadcrumb handler for INFO+ logs (adds context to events)
    logger.addHandler(BreadcrumbHandler(level=logging.INFO))
    # Event handler for ERROR+ logs (creates Sentry events)
    logger.addHandler(EventHandler(level=logging.ERROR))

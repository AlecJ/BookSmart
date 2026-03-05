from time import time
from fastapi import Request

from app.utils import logger


async def log_requests(request: Request, call_next):
    """Log all incoming requests and outgoing responses."""
    start_time = time()

    # Log incoming request
    logger.info(
        f"→ {request.method} {request.url.path}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query": str(request.url.query) if request.url.query else None,
        }
    )

    # Process request
    response = await call_next(request)

    # Log response with duration
    duration = time() - start_time
    logger.info(
        f"← {request.method} {request.url.path} {response.status_code} ({duration:.3f}s)",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_seconds": round(duration, 3),
        }
    )

    return response

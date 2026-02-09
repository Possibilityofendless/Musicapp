import os
import json
import logging
from typing import Any, Dict
import redis
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='[{asctime}] [{levelname}] {message}',
    style='{'
)
logger = logging.getLogger(__name__)

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL)

# API endpoints
BACKEND_API_BASE = os.getenv("BACKEND_API_BASE", "http://localhost:3000/api")


class JobProcessor:
    """Base class for job processors"""

    def process(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a job and return results"""
        raise NotImplementedError


def register_processor(job_type: str, processor_class: type):
    """Register a job processor"""
    logger.info(f"[Workers] Registered processor for job type: {job_type}")


def listen_for_jobs(queue_key: str = "processing"):
    """Listen for new jobs from Redis queue"""
    logger.info(f"[Workers] Listening for jobs on queue: {queue_key}")

    while True:
        try:
            # BLPOP blocks until an item is available
            result = redis_client.blpop(queue_key, timeout=5)
            if result:
                queue_name, job_json = result
                job_data = json.loads(job_json)
                logger.info(f"[Workers] Received job: {job_data.get('type')}")

                # Route to appropriate processor
                job_type = job_data.get("type")
                # Process based on type (would be implemented with actual processors)

        except KeyboardInterrupt:
            logger.info("[Workers] Shutting down...")
            break
        except Exception as e:
            logger.error(f"[Workers] Error processing job: {e}")

from datetime import datetime, timedelta, timezone
from typing import Any


class CacheService:
    def __init__(self) -> None:
        self._items: dict[str, tuple[datetime, Any]] = {}

    def get(self, key: str, ttl_minutes: int) -> Any | None:
        item = self._items.get(key)
        if not item:
            return None
        created_at, value = item
        if datetime.now(timezone.utc) - created_at > timedelta(minutes=ttl_minutes):
            self._items.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._items[key] = (datetime.now(timezone.utc), value)

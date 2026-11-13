from datetime import datetime, timedelta, timezone
from typing import Any, Hashable


class CacheService:
    def __init__(self, max_entries: int = 128) -> None:
        if max_entries < 1:
            raise ValueError("max_entries must be positive")
        self._max_entries = max_entries
        self._items: dict[Hashable, tuple[datetime, Any]] = {}

    def get(self, key: Hashable, ttl_minutes: int) -> Any | None:
        item = self._items.get(key)
        if not item:
            return None
        created_at, value = item
        if datetime.now(timezone.utc) - created_at > timedelta(minutes=ttl_minutes):
            self._items.pop(key, None)
            return None
        return value

    def set(self, key: Hashable, value: Any) -> None:
        # Bounded process-local FIFO cache, not a distributed rate limiter.
        self._items.pop(key, None)
        while len(self._items) >= self._max_entries:
            self._items.pop(next(iter(self._items)))
        self._items[key] = (datetime.now(timezone.utc), value)

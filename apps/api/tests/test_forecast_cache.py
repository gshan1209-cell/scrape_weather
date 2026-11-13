from datetime import datetime, timedelta, timezone
import pytest
from app.core.config import settings
from app.services.weather_service import WeatherService
from app.services.cache_service import CacheService

TZ = timezone(timedelta(hours=8))
def payload(city='臺中市', sent=None):
    now = datetime.now(TZ)
    return {'sent': sent or now.isoformat(), 'records': {'Locations': [{'Location': [{'LocationName': city, 'WeatherElement': [{'ElementName':'MaxT', 'Time':[{'StartTime':now.date().isoformat()+'T06:00:00+08:00', 'ElementValue':[{'value':'28'}]}]}]}]}]}}
class Provider:
    def __init__(self, data=None):
        self.calls = 0
        self.data = data
    async def fetch_weekly_forecast(self, dataset, city):
        self.calls += 1
        if isinstance(self.data, Exception): raise self.data
        return self.data if self.data is not None else payload(city)

@pytest.mark.asyncio
async def test_repeated_live_read_reuses_upstream_but_preserves_district_and_time():
    p=Provider(); s=WeatherService(p)
    first=await s.get_weekly_weather('臺中市','新社區')
    second=await s.get_weekly_weather('臺中市','東勢區')
    assert p.calls == 1
    assert second.district == '東勢區'
    assert second.updatedAt == first.updatedAt
    assert second.dataStatus == 'live'

@pytest.mark.asyncio
async def test_city_and_dataset_do_not_share_cache(monkeypatch):
    p=Provider();s=WeatherService(p)
    await s.get_weekly_weather('臺中市')
    await s.get_weekly_weather('臺北市')
    monkeypatch.setattr(settings,'CWA_WEEKLY_DATASET_ID','SYNTHETIC-OTHER')
    await s.get_weekly_weather('臺中市')
    assert p.calls == 3

@pytest.mark.asyncio
@pytest.mark.parametrize('data', [{'records':{}}, payload(sent='2000-01-01T00:00:00+08:00'), RuntimeError('synthetic')])
async def test_non_live_result_is_not_cached(data):
    p=Provider(data);s=WeatherService(p)
    await s.get_weekly_weather('臺中市'); await s.get_weekly_weather('臺中市')
    assert p.calls == 2

@pytest.mark.asyncio
async def test_expired_source_time_is_revalidated_before_cache_hit(monkeypatch):
    p=Provider();s=WeatherService(p)
    await s.get_weekly_weather('臺中市')
    monkeypatch.setattr(s,'_time_status',lambda value:'stale')
    result=await s.get_weekly_weather('臺中市')
    assert p.calls == 2
    assert result.dataStatus == 'stale'

@pytest.mark.asyncio
async def test_zero_ttl_disables_reuse(monkeypatch):
    monkeypatch.setattr(settings,'CACHE_TTL_MINUTES',0)
    p=Provider();s=WeatherService(p)
    await s.get_weekly_weather('臺中市');await s.get_weekly_weather('臺中市')
    assert p.calls == 2

def test_cache_bound_and_expiry():
    c=CacheService(max_entries=2)
    c.set('a',1);c.set('b',2);c.set('c',3)
    assert c.get('a',180) is None
    assert c.get('c',180)==3
    c._items['c']=(datetime.now(timezone.utc)-timedelta(minutes=181),3)
    assert c.get('c',180) is None

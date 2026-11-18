import pytest
from app.services.weather_service import WeatherService

def station(coords, identity='GOOD'):
    return {'StationId': identity, 'GeoInfo': {'Coordinates': coords}, 'WeatherElement': {}}

def normalize(entries):
    return WeatherService()._normalize_stations({'records': {'Station': entries}})

@pytest.mark.parametrize('coords', [None, [], [None], ['bad'], [{'StationLatitude': 'bad', 'StationLongitude': '120'}], [{'StationLatitude': '-99', 'StationLongitude': '120'}], [{'StationLatitude': '24', 'StationLongitude': '181'}], [{'StationLatitude': 'NaN', 'StationLongitude': '120'}], [{'StationLatitude': '24', 'StationLongitude': 'Infinity'}], [{'StationLatitude': True, 'StationLongitude': '120'}]])
def test_bad_coordinate_station_does_not_discard_good_station(coords):
    good = station([{'StationLatitude':'24', 'StationLongitude':'120'}])
    result = normalize([station(coords, 'BAD'), good])
    assert [s.stationId for s in result.stations] == ['GOOD']

@pytest.mark.parametrize('lat,lon', [(0,0),('0','0'),(-90,-180),(90,180)])
def test_valid_zero_and_boundary_coordinates_preserved(lat, lon):
    result = normalize([station([{'StationLatitude':lat,'StationLongitude':lon}])])
    assert len(result.stations) == 1
    assert (result.stations[0].lat,result.stations[0].lon) == (float(lat),float(lon))

def test_alternate_coordinate_keys_supported():
    result = normalize([station([{'CoordinateLatitude':'24','CoordinateLongitude':'120'}])])
    assert len(result.stations) == 1

def test_all_bad_stations_are_explicitly_empty():
    result = normalize([station([None])])
    assert result.stations == []
    assert result.dataStatus == 'empty'
    assert result.reason == 'empty_dataset'

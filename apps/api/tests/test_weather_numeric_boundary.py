import pytest

from app.services.weather_service import WeatherService


@pytest.mark.parametrize(('value', 'expected'), [
    ('-5', -5), ('+5', 5), (' -99 ', -99), ('70', 70), ('0', 0),
    ('25.5', None), ('-2.5', None), ('10-20', None), ('70%', None),
    ('abc1', None), ('', None), (None, None), (True, None),
])
def test_integer_fields_do_not_strip_signs_or_extract_embedded_digits(value, expected):
    assert WeatherService()._to_int(value) == expected


@pytest.mark.parametrize('name', ['MinCI', 'MaxCI', 'MinComfortIndexDescription', 'MaxComfortIndexDescription'])
def test_comfort_elements_are_not_classified_as_temperature(name):
    bucket = {'weather': '已有天氣資料'}
    WeatherService()._apply_element(bucket, name, '寒冷')
    assert bucket == {'weather': '已有天氣資料', 'comfort': '寒冷'}


def test_day_normalization_keeps_negative_temperature_and_missing_fractional_integer():
    elements = [
        {'elementName': name, 'time': [{'startTime': '2026-11-13T06:00:00+08:00',
                                      'elementValue': [{'value': value}]}]}
        for name, value in [('MaxT', '-5'), ('MinT', '-10'), ('PoP12h', '25.5'), ('MinCI', '寒冷')]
    ]
    day = WeatherService()._days_from_elements(elements)[0]
    assert day.maxTemp == -5
    assert day.minTemp == -10
    assert day.rainProbability is None
    assert day.comfort == '寒冷'

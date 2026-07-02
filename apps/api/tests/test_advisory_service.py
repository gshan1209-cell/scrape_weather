from app.services.advisory_service import AdvisoryService


def test_heat_alert() -> None:
    result = AdvisoryService().generate([{"maxTemp": 36, "minTemp": 25, "rainProbability": 20}], crop="rice")

    assert result["riskLevel"] == "danger"
    assert any(alert["type"] == "heat" for alert in result["alerts"])


def test_rain_alert() -> None:
    result = AdvisoryService().generate([{"maxTemp": 30, "minTemp": 24, "rainProbability": 70}], crop=None)

    assert result["riskLevel"] == "warning"
    assert any(alert["type"] == "rain" for alert in result["alerts"])


def test_normal_weather_fallback() -> None:
    result = AdvisoryService().generate([{"maxTemp": 28, "minTemp": 20, "rainProbability": 10}], crop=None)

    assert result["riskLevel"] == "normal"
    assert result["alerts"][0]["type"] == "general"

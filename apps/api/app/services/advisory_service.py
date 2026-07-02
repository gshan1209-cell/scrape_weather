class AdvisoryService:
    def generate(self, days: list[dict], crop: str | None = None) -> dict:
        alerts = []
        suggestions = [
            "Check field drainage before afternoon rain bands arrive.",
            "Schedule heavy outdoor work for early morning or late afternoon.",
            "Inspect leaves and fruit after rain for disease or pest pressure.",
        ]

        max_temp = max((day.get("maxTemp") or -99 for day in days), default=-99)
        min_temp = min((day.get("minTemp") or 99 for day in days), default=99)
        rain_probability = max((day.get("rainProbability") or 0 for day in days), default=0)
        windy = any("strong" in (day.get("windDescription") or "").lower() for day in days)

        if max_temp >= 35:
            alerts.append(
                {
                    "level": "danger",
                    "type": "heat",
                    "title": "Heat stress risk",
                    "message": "Maximum temperature may reach 35 C or higher. Avoid field work around midday.",
                }
            )
            suggestions.append("Increase irrigation checks and provide shade or ventilation where possible.")

        if rain_probability >= 60:
            alerts.append(
                {
                    "level": "warning",
                    "type": "rain",
                    "title": "Heavy rain possible",
                    "message": "Rain probability is elevated. Clear drainage and delay spraying if rain is near.",
                }
            )
            suggestions.append("Avoid fertilizer or pesticide application before likely rainfall.")

        if min_temp <= 12:
            alerts.append(
                {
                    "level": "warning",
                    "type": "cold",
                    "title": "Low temperature risk",
                    "message": "Low temperatures may stress sensitive crops. Prepare row covers if needed.",
                }
            )

        if windy:
            alerts.append(
                {
                    "level": "warning",
                    "type": "wind",
                    "title": "Wind damage risk",
                    "message": "Secure trellises, nets, and young plants before stronger winds arrive.",
                }
            )

        if crop:
            suggestions.append(self._crop_suggestion(crop))

        risk_level = "normal"
        if any(alert["level"] == "warning" for alert in alerts):
            risk_level = "warning"
        if any(alert["level"] == "danger" for alert in alerts):
            risk_level = "danger"

        summary = self._summary(risk_level, crop)
        if not alerts:
            alerts.append(
                {
                    "level": "info",
                    "type": "general",
                    "title": "Normal field conditions",
                    "message": "No major weather risk was detected in the weekly forecast.",
                }
            )

        return {"summary": summary, "riskLevel": risk_level, "alerts": alerts, "suggestions": suggestions}

    def _summary(self, risk_level: str, crop: str | None) -> str:
        crop_text = f" for {crop}" if crop else ""
        if risk_level == "danger":
            return f"High priority weather risks are expected{crop_text}. Adjust field work plans."
        if risk_level == "warning":
            return f"Some weather risks are expected{crop_text}. Monitor timing and protect vulnerable areas."
        return f"Weather risk looks manageable{crop_text}. Keep routine checks in place."

    def _crop_suggestion(self, crop: str) -> str:
        normalized = crop.strip().lower()
        if normalized in {"rice", "paddy"}:
            return "For rice, keep water levels steady and watch lodging risk after storms."
        if normalized in {"leafy greens", "vegetables", "veg"}:
            return "For leafy crops, reduce heat stress and watch fungal pressure after rain."
        if normalized in {"fruit", "orchard"}:
            return "For fruit crops, secure branches and check fruit cracking after heavy rain."
        return "Use the forecast to tune irrigation, spraying, and harvest timing for this crop."

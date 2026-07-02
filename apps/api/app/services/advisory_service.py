class AdvisoryService:
    def generate(self, days: list[dict], crop: str | None = None) -> dict:
        alerts = []
        suggestions = [
            "午後降雨前先檢查田區排水與溝渠是否暢通。",
            "高溫時段避免長時間戶外作業，優先安排清晨或傍晚工作。",
            "雨後巡查葉片與果實，留意病害、裂果與蟲害壓力。",
        ]

        max_temp = max((day.get("maxTemp") or -99 for day in days), default=-99)
        min_temp = min((day.get("minTemp") or 99 for day in days), default=99)
        rain_probability = max((day.get("rainProbability") or 0 for day in days), default=0)
        windy = any("強" in (day.get("windDescription") or "") or "strong" in (day.get("windDescription") or "").lower() for day in days)

        if max_temp >= 35:
            alerts.append(
                {
                    "level": "danger",
                    "type": "heat",
                    "title": "高溫熱害風險",
                    "message": "最高溫可能達 35°C 以上，請避開中午前後的田間作業並補充水分。",
                }
            )
            suggestions.append("加強灌溉巡檢，溫室或網室作物需注意通風與遮陰。")

        if rain_probability >= 60:
            alerts.append(
                {
                    "level": "warning",
                    "type": "rain",
                    "title": "降雨機率偏高",
                    "message": "本週有較高降雨機率，請先清理排水並避開雨前施藥或施肥。",
                }
            )
            suggestions.append("降雨前避免施肥與噴藥，減少流失與防治效果下降。")

        if min_temp <= 12:
            alerts.append(
                {
                    "level": "warning",
                    "type": "cold",
                    "title": "低溫風險",
                    "message": "低溫可能影響敏感作物，必要時準備覆蓋或保溫措施。",
                }
            )

        if windy:
            alerts.append(
                {
                    "level": "warning",
                    "type": "wind",
                    "title": "風害風險",
                    "message": "請固定支架、防風網與幼苗，降低強風造成的倒伏或折損。",
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
                    "title": "田間條件穩定",
                    "message": "一週預報未偵測到明顯天氣風險，可維持例行巡田與作業安排。",
                }
            )

        return {"summary": summary, "riskLevel": risk_level, "alerts": alerts, "suggestions": suggestions}

    def _summary(self, risk_level: str, crop: str | None) -> str:
        crop_text = f"（{crop}）" if crop else ""
        if risk_level == "danger":
            return f"本週有較高優先度的天氣風險{crop_text}，建議調整田間作業時段與防護措施。"
        if risk_level == "warning":
            return f"本週需留意部分天氣風險{crop_text}，請掌握降雨與高溫時段並保護脆弱田區。"
        return f"本週天氣風險大致可控{crop_text}，維持例行巡檢即可。"

    def _crop_suggestion(self, crop: str) -> str:
        normalized = crop.strip().lower()
        if normalized in {"水稻", "rice", "paddy"}:
            return "水稻田請維持穩定水位，雨後留意倒伏與病害擴散。"
        if normalized in {"葉菜", "葉菜類", "leafy greens", "vegetables", "veg"}:
            return "葉菜類請降低高溫萎凋壓力，雨後加強通風並留意真菌性病害。"
        if normalized in {"果樹", "水果", "fruit", "orchard"}:
            return "果樹請固定枝條與支架，豪雨後檢查裂果與落果情形。"
        return "請依預報調整灌溉、施藥、施肥與採收時程。"

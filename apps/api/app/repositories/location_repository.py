from app.schemas.location import LocationItem


class LocationRepository:
    def list_locations(self) -> list[LocationItem]:
        return [
            LocationItem(city="Taipei", districts=["Beitou", "Shilin", "Neihu", "Wenshan"]),
            LocationItem(city="Taichung", districts=["Xinshe", "Wufeng", "Dali", "Dongshi"]),
            LocationItem(city="Tainan", districts=["Xinhua", "Yujing", "Shanhua", "Madou"]),
            LocationItem(city="Kaohsiung", districts=["Meinong", "Qishan", "Dashu", "Yanchao"]),
            LocationItem(city="Hualien", districts=["Shoufeng", "Yuli", "Fenglin", "Guangfu"]),
        ]

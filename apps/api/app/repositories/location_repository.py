from app.schemas.location import LocationItem


class LocationRepository:
    def list_locations(self) -> list[LocationItem]:
        return [
            LocationItem(city="臺北市", districts=["北投區", "士林區", "內湖區", "文山區"]),
            LocationItem(city="臺中市", districts=["新社區", "霧峰區", "大里區", "東勢區"]),
            LocationItem(city="臺南市", districts=["新化區", "玉井區", "善化區", "麻豆區"]),
            LocationItem(city="高雄市", districts=["美濃區", "旗山區", "大樹區", "燕巢區"]),
            LocationItem(city="花蓮縣", districts=["壽豐鄉", "玉里鎮", "鳳林鎮", "光復鄉"]),
        ]

from sqlalchemy import JSON, Column, DateTime, Integer, String

from app.core.database import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=True)
    source_dataset = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True)
    normalized_data = Column(JSON, nullable=True)
    fetched_at = Column(DateTime, nullable=False)

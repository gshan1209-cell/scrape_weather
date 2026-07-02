from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)

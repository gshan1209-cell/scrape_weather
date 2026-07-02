from sqlalchemy import JSON, Column, Integer, String

from app.core.database import Base


class CropProfile(Base):
    __tablename__ = "crop_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    risk_rules = Column(JSON, nullable=True)

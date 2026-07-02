from sqlalchemy import JSON, Column, DateTime, Integer, String

from app.core.database import Base


class AdvisoryLog(Base):
    __tablename__ = "advisory_logs"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=True)
    crop = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)
    advisory_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False)

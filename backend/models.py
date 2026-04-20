from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from database import Base 

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    betrieb_id = Column(Integer, index=True)
    type = Column(String, default="main")
    status = Column(String, default="submitted")
    form_data = Column(JSON)          # The 9 sprayings
    selected_parcels = Column(JSON)   # From Map
    supporting_documents = Column(JSON) # MinIO paths
    created_at = Column(DateTime, default=datetime.utcnow)
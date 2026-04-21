from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from datetime import datetime
from database import Base 

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User and winery identification
    user_id = Column(String, index=True)      # Keycloak 'sub'
    betrieb_id = Column(Integer, index=True)   # Winery ID
    
    # ---  Legal Winery Snapshot ---
    winery_name = Column(String, nullable=True) 
    is_bio = Column(Boolean, default=False)
    
    # Application Metadata
    type = Column(String, default="main")      # main, 48h_report, yearly_report
    status = Column(String, default="submitted")
    
    # Data Blobs
    form_data = Column(JSON)          # The 9 spraying stages
    selected_parcels = Column(JSON)   # Selected Flurstücke
    supporting_documents = Column(JSON) # MinIO file paths
    
    created_at = Column(DateTime, default=datetime.utcnow)
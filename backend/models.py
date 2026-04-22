from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
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

    # Relationships
    jahresmeldung = relationship("Jahresmeldung", back_populates="application", uselist=False)
    report_48h = relationship("Report48h", back_populates="application")


class Jahresmeldung(Base):
    __tablename__ = "jahresmeldungen"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True)
    
    user_id = Column(String, index=True)
    betrieb_id = Column(Integer, index=True)
    spritzgemeinschaft = Column(String, nullable=True)
    
    # The form_data will store the flurstuecke and the 9 spritzungen details.
    form_data = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    application = relationship("Application", back_populates="jahresmeldung")


class Report48h(Base):
    __tablename__ = "report_48h"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    
    user_id = Column(String, index=True)
    betrieb_id = Column(Integer, index=True)
    spritzgemeinschaft = Column(String, nullable=True)
    
    # The form_data will store the flurstuecke and the 1 spritzung details.
    form_data = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    application = relationship("Application", back_populates="report_48h")
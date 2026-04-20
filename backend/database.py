from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Connect to the DB container using its service name
SQLALCHEMY_DATABASE_URL = "postgresql://kiwi_user:kiwi_password@kiwi_bvl_db:5432/bvl_data"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
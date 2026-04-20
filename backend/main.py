from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from typing import List, Optional
import pandas as pd

app = FastAPI(title="KIWI Drone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (fine for development)
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Database Connection
DB_URL = 'postgresql://kiwi_user:kiwi_password@localhost:5432/bvl_data'
engine = create_engine(DB_URL)

@app.get("/")
def root():
    return {"message": "KIWI Drone API is running"}

# 1 & 2. Search for Disease and get Code
@app.get("/search/disease")
def search_disease(q: str):
    # We removed 'AND kodeliste = 2' so it finds your 947 codes
    query = text("""
        SELECT kode, kodetext, kodeliste
        FROM kode 
        WHERE kodetext ILIKE :search 
        AND sprache = 'DE'
        LIMIT 20
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"search": f"%{q}%"}).mappings().all()
    
    # Clean up the 'kode' if it looks like "(CODE, 123, ...)"
    cleaned_results = []
    for row in result:
        raw_kode = row['kode']
        # If the kode starts with '(', it's a tuple string. We extract the first part.
        if isinstance(raw_kode, str) and raw_kode.startswith('('):
            # Converts "(ERYSPI,947,...)" -> "ERYSPI"
            clean_kode = raw_kode.replace('(', '').split(',')[0]
        else:
            clean_kode = raw_kode
            
        cleaned_results.append({
            "kode": clean_kode,
            "kodetext": row['kodetext'],
            "kodeliste": row['kodeliste']
        })
        
    return cleaned_results

# 3. Search for Product Name and get ID (kennr)
@app.get("/search/product")
def search_product(q: str):
    query = text("""
        SELECT kennr, mittelname 
        FROM mittel 
        WHERE mittelname ILIKE :search
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"search": f"%{q}%"}).mappings().all()
    return result

# 4, 5, & 6. Find valid applications (AWG IDs) for Wine (VITVI) and specific Disease
@app.get("/calculate/permitted-spray")
def get_permitted_spray(product_id: str, disease_code: str):
    """
    This joins the tables to find exactly what is allowed for 
    Vineyards (VITVI) for a specific product and disease.
    """
    query = text("""
        SELECT 
            k.awg_id,
            a.aufwandbedingung as es_stage,
            a.m_aufwand as amount,
            a.m_aufwand_einheit as unit
        FROM awg_kultur k
        JOIN awg_schadorg s ON k.awg_id = s.awg_id
        JOIN awg_aufwand a ON k.awg_id = a.awg_id
        WHERE k.kultur = 'VITVI'
        AND k.awg_id LIKE :prod_id
        AND s.schadorg = :dis_code
    """)
    
    with engine.connect() as conn:
        # product_id in 'mittel' is like '024459-00', 
        # but awg_id starts with that ID.
        result = conn.execute(query, {
            "prod_id": f"{product_id}%", 
            "dis_code": disease_code
        }).mappings().all()
    
    if not result:
        raise HTTPException(status_code=404, detail="No authorized application found for this combination in vineyards.")
        
    return result
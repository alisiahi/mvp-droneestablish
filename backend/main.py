import os
import boto3
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.responses import RedirectResponse
from database import engine, SessionLocal, Base
from models import Application

Base.metadata.create_all(bind=engine)
app = FastAPI(title="KIWI Drone API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

s3 = boto3.client(
    "s3",
    endpoint_url=f"http://{os.getenv('MINIO_ENDPOINT', 'minio:9000')}",
    aws_access_key_id=os.getenv("MINIO_ACCESS_KEY", "admin"), 
    aws_secret_access_key=os.getenv("MINIO_SECRET_KEY", "adminpassword") 
)
BUCKET_NAME = "kiwi-documents"

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.on_event("startup")
async def init_storage():
    try: s3.head_bucket(Bucket=BUCKET_NAME)
    except: s3.create_bucket(Bucket=BUCKET_NAME)

@app.get("/applications/{betrieb_id}")
def get_applications(betrieb_id: int, db: Session = Depends(get_db)):
    apps = db.query(Application).filter(Application.betrieb_id == betrieb_id).order_by(Application.created_at.desc()).all()
    return apps

@app.get("/download/{file_path:path}")
async def download_file(file_path: str):
    try:
        # Generate the internal presigned URL (valid for 1 hour)
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': BUCKET_NAME, 'Key': file_path},
            ExpiresIn=3600
        )
        
        # --- FIX: Convert internal Docker hostname to localhost for your browser ---
        # This transforms http://minio:9000/... into http://localhost:9000/...
        public_url = url.replace("http://minio:9000", "http://localhost:9000")
        
        return RedirectResponse(public_url)
    except Exception as e:
        print(f"Download error: {e}")
        raise HTTPException(status_code=404, detail="Datei nicht gefunden")
    
@app.post("/applications")
def create_application(payload: dict, db: Session = Depends(get_db)):
    new_app = Application(**payload)
    db.add(new_app)
    db.commit()
    return {"status": "success", "id": new_app.id}

@app.post("/upload/{betrieb_id}/{app_temp_id}")
async def upload_file(betrieb_id: int, app_temp_id: str, file: UploadFile = File(...)):
    file_path = f"{betrieb_id}/{app_temp_id}/{file.filename}"
    s3.upload_fileobj(file.file, BUCKET_NAME, file_path)
    return {"minio_path": file_path}


@app.get("/")
def root():
    return {"message": "KIWI Drone API is running"}

@app.get("/search/disease")
def search_disease(q: str):
    query = text("""
        SELECT kode, kodetext, kodeliste
        FROM kode 
        WHERE kodetext ILIKE :search 
        AND sprache = 'DE'
        LIMIT 20
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"search": f"%{q}%"}).mappings().all()
    
    cleaned_results = []
    for row in result:
        raw_kode = row['kode']
        if isinstance(raw_kode, str) and raw_kode.startswith('('):
            clean_kode = raw_kode.replace('(', '').split(',')[0]
        else:
            clean_kode = raw_kode
            
        cleaned_results.append({
            "kode": clean_kode,
            "kodetext": row['kodetext'],
            "kodeliste": row['kodeliste']
        })
    return cleaned_results

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

@app.get("/calculate/permitted-spray")
def get_permitted_spray(product_id: str, disease_code: str):
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
        result = conn.execute(query, {
            "prod_id": f"{product_id}%", 
            "dis_code": disease_code
        }).mappings().all()
    
    if not result:
        raise HTTPException(status_code=404, detail="No authorized application found.")
        
    return result
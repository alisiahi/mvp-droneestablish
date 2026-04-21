import time
import pandas as pd
from sqlalchemy import create_engine
import os

# 1. Connect to the database
DB_URL = os.getenv('DATABASE_URL', 'postgresql://kiwi_user:kiwi_password@kiwi_bvl_db:5432/bvl_data')
engine = create_engine(DB_URL)

def clean_and_upload():
    # Folder where CSV files are now located
    data_folder = "raw_csv_data"
    
    # List of your files and the table names
    files_to_load = {
        "kode": "kode.csv",
        "mittel": "mittel.csv",
        "awg_schadorg": "awg_schadorg.csv",
        "awg_kultur": "awg_kultur.csv",
        "awg_aufwand": "awg_aufwand.csv"
    }

    for table_name, file_name in files_to_load.items():
        # Construct the full path: raw_csv_data/filename.csv
        file_path = os.path.join(data_folder, file_name)
        
        if not os.path.exists(file_path):
            print(f"Skipping {file_name}: File not found at {file_path}!")
            continue

        print(f"Reading {file_path}...")
        
        # Read the CSV
        df = pd.read_csv(file_path, sep=None, engine='python', encoding='utf-8')

        # Clean the column names
        df.columns = [c.replace('$', '').replace(' ', '_').lower() for c in df.columns]

        print(f"Uploading to table '{table_name}'...")
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        print(f"Done! Loaded {len(df)} rows into {table_name}.\n")

if __name__ == "__main__":
    max_retries = 5
    for i in range(max_retries):
        try:
            with engine.connect() as connection:
                print("Database connection successful!")
                break
        except Exception:
            print(f"Database not ready yet (Attempt {i+1}/{max_retries}). Waiting...")
            time.sleep(3)
    else:
        print("Could not connect to the database. Exiting.")
        exit(1)

    try:
        clean_and_upload()
        print("All data has been successfully loaded into PostgreSQL!")
    except Exception as e:
        print(f"An error occurred during upload: {e}")
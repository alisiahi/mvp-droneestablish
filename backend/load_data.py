import time
import pandas as pd
from sqlalchemy import create_engine
import os

# 1. Connect to the database we just started in Docker
# The address is: user:password@localhost:port/database_name
DB_URL = os.getenv('DATABASE_URL', 'postgresql://kiwi_user:kiwi_password@localhost:5432/bvl_data')
engine = create_engine(DB_URL)

def clean_and_upload():
    # List of your files and the table names we want in the DB
    files_to_load = {
        "kode": "kode.csv",
        "mittel": "mittel.csv",
        "awg_schadorg": "awg_schadorg.csv",
        "awg_kultur": "awg_kultur.csv",
        "awg_aufwand": "awg_aufwand.csv"
    }

    for table_name, file_name in files_to_load.items():
        if not os.path.exists(file_name):
            print(f"Skipping {file_name}: File not found!")
            continue

        print(f"Reading {file_name}...")
        
        # Read the CSV. BVL files often use ';' as a separator.
        # 'sep=None' tells pandas to guess if it's a comma or semicolon.
        df = pd.read_csv(file_name, sep=None, engine='python', encoding='utf-8')

        # Clean the column names so the database likes them 
        # (removes symbols like $ and replaces spaces with _)
        df.columns = [c.replace('$', '').replace(' ', '_').lower() for c in df.columns]

        print(f"Uploading to table '{table_name}'...")
        # This creates the table and puts the data in
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        print(f"Done! Loaded {len(df)} rows into {table_name}.\n")

if __name__ == "__main__":
    # Wait for the database to be ready
    max_retries = 5
    for i in range(max_retries):
        try:
            # Try to connect to the database
            with engine.connect() as connection:
                print("Database connection successful!")
                break
        except Exception:
            print(f"Database not ready yet (Attempt {i+1}/{max_retries}). Waiting...")
            time.sleep(3) # Wait 3 seconds before trying again
    else:
        print("Could not connect to the database after several attempts. Exiting.")
        exit(1)

    try:
        clean_and_upload()
        print("All data has been successfully loaded into PostgreSQL!")
    except Exception as e:
        print(f"An error occurred during upload: {e}")
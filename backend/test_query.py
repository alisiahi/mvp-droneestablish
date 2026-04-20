import pandas as pd
from sqlalchemy import create_engine

engine = create_engine('postgresql://kiwi_user:kiwi_password@localhost:5432/bvl_data')

def test_workflow():
    # Example: Searching for a disease code
    disease_search = "Echter Mehltau"
    query = f"SELECT kode, kodetext FROM kode WHERE kodetext ILIKE '%%{disease_search}%%' AND sprache = 'DE' LIMIT 5"
    results = pd.read_sql(query, engine)
    print("--- Step 1: Disease Code Search Results ---")
    print(results)

if __name__ == "__main__":
    test_workflow()
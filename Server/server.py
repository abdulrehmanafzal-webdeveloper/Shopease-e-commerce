import uvicorn
from App.main import app

# This file is the actual entry point for Railway

if __name__ == "__main__":
    uvicorn.run("App.main:app", host="0.0.0.0", port=8000)
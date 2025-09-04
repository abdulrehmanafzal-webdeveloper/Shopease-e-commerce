import os
import uvicorn

# This file is the actual entry point for Railway

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("App.main:app", host="0.0.0.0", port=port)
from fastapi import FastAPI, Request
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging

# Routers
from App.Routes import users, products, cart, checkout, categories

# ------------------ App Setup ------------------
app = FastAPI(title="E-commerce API", version="1.0.0")

# CORS middleware
origins = [
    "http://localhost:5173",       # Local dev
    "https://yourfrontend.com",    # Production frontend
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Serve Uploaded Files ------------------
# Make sure "uploads" folder exists in your project root
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ------------------ Global Exception Handler ------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please try again later."}
    )

# ------------------ Routers ------------------
app.include_router(users.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(categories.router)
app.include_router(checkout.router)

# ------------------ Root Endpoint ------------------
@app.get("/")
def root():
    return {"message": "E-commerce API is running 🚀"}

# ------------------ Entry Point ------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)
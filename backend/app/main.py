# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# import routers (don’t execute include_router before app exists)
from .routers import upload

app = FastAPI(title="RateMySchedule API")

# allow local Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routers
app.include_router(upload.router)

@app.get("/health")
def health():
    return {"ok": True, "env": os.getenv("ENV", "dev")}

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import engine, Base, SessionLocal
from backend.app.api import (
    auth,
    accounts,
    transactions,
    budgets,
    goals,
    recurring,
    ai,
    kyc,
    credit_risk,
    reports,
    notifications,
    admin,
    dashboard,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create all tables on startup
    Base.metadata.create_all(bind=engine)
    
    # Auto seed initial demo dataset if database is empty
    from backend.app.seed import seed_database
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    yield


app = FastAPI(
    title="SmartBank AI — AI-Powered Smart Banking & Financial Intelligence Platform",
    description="Full-stack AI FinTech application featuring explainable anomaly detection, expense forecasting, auto-categorization, grounded financial assistant, smart budgets, and admin risk center.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(recurring.router)
app.include_router(ai.router)
app.include_router(kyc.router)
app.include_router(credit_risk.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "SmartBank AI Backend",
        "version": "1.0.0",
        "environment": "production-demo",
        "currency": "INR (₹)",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, List, Optional, Dict, Any, Annotated
from exo import exo

app = FastAPI(title="Exoplanet Classifier API", version="1.0.0")

# Allow calls from your frontend (tighten origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # e.g. ["http://localhost:5173", "https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FloatGT0 = Annotated[float, Field(gt=0)]


class ExoRequest(BaseModel):
    orbital_period: FloatGT0
    transit_depth: FloatGT0     # fraction (0.001 = 0.1%)
    duration: FloatGT0          # hours (or your chosen unit; be consistent)
    snr: FloatGT0
    star_radius: FloatGT0       # solar radii
    star_temperature: FloatGT0  # Kelvin
    star_magnitude: float

class ExoResponse(BaseModel):
    label: Literal["exo", "candidate", "not exo"]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=ExoResponse)
def predict(req: ExoRequest):
    try:
        label = exo(
            req.orbital_period, req.transit_depth, req.duration, req.snr,
            req.star_radius, req.star_temperature, req.star_magnitude
        )
        return ExoResponse(label=label)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

# ==== Frontend compatibility layer ====
# The React frontend's AIModelService posts to /api/analyze with a payload
# { data: [...], analysis_type: string, parameters: {}, model_name?: string }
# and expects a response containing success, predictions, insights, etc.

class FrontendPlanet(BaseModel):
    # Mirrors the shape produced by formatDataForModel in the frontend
    name: Optional[str] = None
    orbital_period: float
    transit_depth: float
    transit_duration: float  # maps to our "duration"
    signal_to_noise_ratio: float  # maps to our "snr"
    stellar_radius: float         # maps to our "star_radius"
    stellar_temperature: float    # maps to our "star_temperature"
    stellar_magnitude: float      # maps to our "star_magnitude"
    date_added: Optional[str] = None
    notes: Optional[str] = None

class AnalyzeRequest(BaseModel):
    data: List[FrontendPlanet]
    analysis_type: Optional[str] = "classification"
    parameters: Optional[Dict[str, Any]] = None
    model_name: Optional[str] = None

class PredictionItem(BaseModel):
    name: Optional[str] = None
    label: Literal["exo", "candidate", "not exo"]

class AnalyzeResponse(BaseModel):
    success: bool
    predictions: List[PredictionItem]
    insights: List[str] = []
    recommendations: List[str] = []
    anomalies: List[Dict[str, Any]] = []
    model_version: str = "api-1.0.0"
    timestamp: float
    processing_time: float

@app.get("/api/analyze/health")
def analyze_health():
    # Convenience for the frontend when endpoint is set to /api/analyze
    return {"status": "ok"}

@app.post("/api/analyze", response_model=AnalyzeResponse)
def api_analyze(req: AnalyzeRequest):
    import time
    t0 = time.time()
    try:
        predictions: List[PredictionItem] = []
        for p in req.data:
            label = exo(
                p.orbital_period,
                p.transit_depth,
                p.transit_duration,  # duration
                p.signal_to_noise_ratio,  # snr
                p.stellar_radius,
                p.stellar_temperature,
                p.stellar_magnitude,
            )
            predictions.append(PredictionItem(name=p.name, label=label))

        elapsed = (time.time() - t0) * 1000.0
        return AnalyzeResponse(
            success=True,
            predictions=predictions,
            insights=[],
            recommendations=[],
            anomalies=[],
            model_version=req.model_name or "api-1.0.0",
            timestamp=time.time(),
            processing_time=elapsed,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch inference error: {str(e)}")

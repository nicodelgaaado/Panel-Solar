from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math

SUN_HOURS_PER_DAY = 5.0  # Average peak sun hours assumed for sizing
PERFORMANCE_RATIO = 0.8  # Accounts for system inefficiencies
PANEL_POWER_W = 550
PANEL_COST_COP = 2_100_000
ENERGY_PRICE_COP_PER_KWH = 926
PANEL_AREA_M2 = 2.1  # Approximate area per 550 W panel
MONTH_DAYS = 30  # Simplified average month length


class CalculationRequest(BaseModel):
    monthly_kwh: float = Field(gt=0, description="Promedio de consumo energético mensual en kWh.")


class CalculationResponse(BaseModel):
    system_size_kw: float
    panel_count: int
    monthly_savings_cop: float
    installation_cost_cop: float
    payback_years: float
    area_m2: float


app = FastAPI(title="Solar System Sizing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Solar System Sizing API",
        "docs": "/docs",
    }


@app.post("/calculate", response_model=CalculationResponse)
async def calculate_system(data: CalculationRequest):
    monthly_kwh = data.monthly_kwh
    if monthly_kwh <= 0:
        raise HTTPException(status_code=400, detail="El consumo mensual debe ser mayor a cero.")

    daily_kwh = monthly_kwh / MONTH_DAYS
    effective_daily_output = SUN_HOURS_PER_DAY * PERFORMANCE_RATIO

    if effective_daily_output <= 0:
        raise HTTPException(status_code=500, detail="Parámetros de cálculo inválidos.")

    system_size_kw = daily_kwh / effective_daily_output
    raw_panel_count = (system_size_kw * 1000) / PANEL_POWER_W
    panel_count = max(1, math.ceil(raw_panel_count))

    monthly_savings_cop = monthly_kwh * ENERGY_PRICE_COP_PER_KWH
    installation_cost_cop = panel_count * PANEL_COST_COP
    annual_savings_cop = monthly_savings_cop * 12
    payback_years = installation_cost_cop / annual_savings_cop if annual_savings_cop else math.inf
    area_m2 = panel_count * PANEL_AREA_M2

    return CalculationResponse(
        system_size_kw=round(system_size_kw, 2),
        panel_count=panel_count,
        monthly_savings_cop=round(monthly_savings_cop, 2),
        installation_cost_cop=round(installation_cost_cop, 2),
        payback_years=round(payback_years, 2),
        area_m2=round(area_m2, 2),
    )

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import math

# Parametros base para dimensionar el sistema solar residencial
SUN_HOURS_PER_DAY = 5.0  # Horas promedio de sol pico asumidas para el calculo
PERFORMANCE_RATIO = 0.8  # Ineficiencias globales (cables, inversor, temperatura)
PANEL_POWER_W = 550
PANEL_COST_COP = 2_100_000
ENERGY_PRICE_COP_PER_KWH = 926
PANEL_AREA_M2 = 2.1  # Area aproximada de un panel de 550 W
MONTH_DAYS = 30  # Longitud promedio simplificada de un mes


class CalculationRequest(BaseModel):
    """Modelo de entrada con el consumo mensual reportado."""

    monthly_kwh: float = Field(gt=0, description="Promedio de consumo energetico mensual en kWh.")


class CalculationResponse(BaseModel):
    """Respuesta estandarizada enviada al frontend."""

    system_size_kw: float
    panel_count: int
    monthly_savings_cop: float
    installation_cost_cop: float
    payback_years: float
    area_m2: float


app = FastAPI(title="Solar System Sizing API", version="1.0.0")  # Instancia principal de la aplicacion

# Configura los permisos de peticiones desde los origenes conocidos del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://panel-solar.vercel.app",
        "https://panel-solar.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint basico para verificar el estado del servicio."""
    return {
        "message": "Solar System Sizing API",
        "docs": "/docs",
    }


@app.post("/calculate", response_model=CalculationResponse)
async def calculate_system(data: CalculationRequest):
    """Dimensiona el sistema con base en el consumo mensual entregado."""
    monthly_kwh = data.monthly_kwh
    if monthly_kwh <= 0:
        raise HTTPException(status_code=400, detail="El consumo mensual debe ser mayor a cero.")

    daily_kwh = monthly_kwh / MONTH_DAYS  # Promedio diario simplificado
    effective_daily_output = SUN_HOURS_PER_DAY * PERFORMANCE_RATIO  # Produccion diaria util por kW instalado

    if effective_daily_output <= 0:
        raise HTTPException(status_code=500, detail="Parametros de calculo invalidos.")

    system_size_kw = daily_kwh / effective_daily_output  # Capacidad requerida del sistema en kW
    raw_panel_count = (system_size_kw * 1000) / PANEL_POWER_W  # Paneles necesarios sin redondear
    panel_count = max(1, math.ceil(raw_panel_count))  # Al menos un panel y solo valores enteros

    monthly_savings_cop = monthly_kwh * ENERGY_PRICE_COP_PER_KWH  # Ahorro mensual estimado
    installation_cost_cop = panel_count * PANEL_COST_COP  # Costo aproximado de la instalacion
    annual_savings_cop = monthly_savings_cop * 12  # Proyeccion anual de ahorros
    payback_years = installation_cost_cop / annual_savings_cop if annual_savings_cop else math.inf  # Tiempo de retorno
    area_m2 = panel_count * PANEL_AREA_M2  # Superficie requerida para instalar los paneles

    return CalculationResponse(
        system_size_kw=round(system_size_kw, 2),
        panel_count=panel_count,
        monthly_savings_cop=round(monthly_savings_cop, 2),
        installation_cost_cop=round(installation_cost_cop, 2),
        payback_years=round(payback_years, 2),
        area_m2=round(area_m2, 2),
    )

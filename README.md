# Panel Solar – Aplicación Web

Aplicación que dimensiona un sistema solar fotovoltaico a partir del consumo energético mensual. El proyecto se compone de un backend en FastAPI y un frontend en React (Vite).

## Requerimientos

- Python 3.10+
- Node.js 18+ y npm

## Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # En PowerShell: .\.venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload
```

El servidor expone la ruta `POST /calculate` que recibe:

```json
{ "monthly_kwh": 400 }
```

Y responde con los cálculos del sistema solar en formato JSON.

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Por defecto el frontend espera que la API esté disponible en `http://localhost:8000`. Puedes cambiarlo creando un archivo `.env` con la variable `VITE_API_URL`.

## Lógica de cálculo

- Horas solares pico promedio: **5 h/día**
- Relación de rendimiento (pérdidas del sistema): **0.8**
- Potencia por panel: **550 W**
- Costo de instalación por panel: **2 100 000 COP**
- Precio de la energía: **926 COP/kWh**
- Área estimada por panel: **2.1 m²**

La potencia del sistema en kW se obtiene dividiendo el consumo diario entre las horas solares pico efectivas (`horas solares * relación de rendimiento`). El número de paneles es el resultado entero hacia arriba de la potencia total en watts sobre 550 W. Con ello se estiman el costo total, los ahorros y el retorno de inversión en años.

## Estructura

- `backend/`: API FastAPI (`uvicorn main:app --reload`)
- `frontend/`: React + Vite (`npm run dev`)

import { useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const PANEL_POWER_W = 550;
const ENERGY_PRICE_COP_PER_KWH = 926;
const PANEL_COST_COP = 2_100_000;
const SUN_HOURS_PER_DAY = 5;
const PERFORMANCE_RATIO = 0.8;
const PANEL_AREA_M2 = 2.1;

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value) =>
  new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value);

export default function App() {
  const [monthlyKwh, setMonthlyKwh] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const parsedValue = Number(monthlyKwh);
    if (!parsedValue || parsedValue <= 0) {
      setError("Ingresa un valor mayor a cero.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monthly_kwh: parsedValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail ?? "Error inesperado en el servidor.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Simulador de Paneles Solares</h1>
        <p>
          Ingresa tu consumo promedio mensual de energía para estimar el tamaño
          del sistema solar y su rentabilidad.
        </p>
      </header>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="monthly-kwh">Consumo mensual (kWh)</label>
          <input
            id="monthly-kwh"
            type="number"
            min="1"
            step="any"
            value={monthlyKwh}
            onChange={(event) => setMonthlyKwh(event.target.value)}
            placeholder="Ej. 400"
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Calculando..." : "Calcular"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="results">
            <h2>Resultados estimados</h2>
            <ul>
              <li>
                <span>Potencia del sistema:</span>
                <strong>{result.system_size_kw} kW</strong>
              </li>
              <li>
                <span>Número de paneles (550 W):</span>
                <strong>{result.panel_count}</strong>
              </li>
              <li>
                <span>Ahorro mensual estimado:</span>
                <strong>{formatCurrency(result.monthly_savings_cop)}</strong>
              </li>
              <li>
                <span>Costo de instalación:</span>
                <strong>{formatCurrency(result.installation_cost_cop)}</strong>
              </li>
              <li>
                <span>Retorno de inversión:</span>
                <strong>{result.payback_years} años</strong>
              </li>
              <li>
                <span>Área requerida:</span>
                <strong>{result.area_m2} m²</strong>
              </li>
            </ul>
            <p className="footnote">
              Las estimaciones suponen {PANEL_POWER_W} W por panel,{" "}
              {formatNumber(ENERGY_PRICE_COP_PER_KWH)} COP por kWh, un costo de
              instalación de {formatCurrency(PANEL_COST_COP)} por panel,{" "}
              {formatNumber(SUN_HOURS_PER_DAY)} horas solares pico, una relación
              de rendimiento de {formatNumber(PERFORMANCE_RATIO)} y un área
              aproximada de {formatNumber(PANEL_AREA_M2)} m² por panel.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

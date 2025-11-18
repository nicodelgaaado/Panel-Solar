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
      <header className="top-bar">
        <div className="brand">
          <div className="brand__icon" aria-hidden="true">
            ☀️
          </div>
          <div>
            <p className="overline">Material Design 3</p>
            <h1>Simulador de Paneles Solares</h1>
            <p className="lead">
              Ingresa tu consumo mensual para estimar el tamaño del sistema y su
              rentabilidad con componentes solares residenciales.
            </p>
          </div>
        </div>

        <div className="assistive-chips" aria-label="Pilares del cálculo">
          <span className="assistive-chip">Cálculo instantáneo</span>
          <span className="assistive-chip">Supuestos claros</span>
          <span className="assistive-chip">Valores listos para acción</span>
        </div>
      </header>

      <section className="layout">
        <div className="card form-card">
          <div className="card__header">
            <div>
              <p className="title-label">Datos de consumo</p>
              <h2>Recibe una proyección personalizada</h2>
            </div>
            <p className="supporting-text">
              Usamos tarifas promedio locales, radiación solar típica y
              rendimiento realista de componentes para dimensionar tu sistema.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="monthly-kwh">
              Consumo mensual (kWh)
            </label>
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
            <div className="actions">
              <button className="button button--filled" type="submit" disabled={isLoading}>
                {isLoading ? "Calculando..." : "Calcular"}
              </button>
              <span className="helper-text">
                Basado en tarifa de {formatNumber(ENERGY_PRICE_COP_PER_KWH)} COP/kWh
              </span>
            </div>
          </form>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="card results-card">
          <div className="card__header">
            <p className="title-label">Resultados estimados</p>
            <h2>Impacto energético y financiero</h2>
            <p className="supporting-text">
              Valores listos para presentar, con foco en ahorro, inversión y
              espacio necesario.
            </p>
          </div>

          {result ? (
            <>
              <div className="highlight">
                <div>
                  <p className="overline">Retorno aproximado</p>
                  <strong className="highlight__value">{result.payback_years} años</strong>
                  <p className="supporting-text">Tiempo estimado para recuperar la inversión.</p>
                </div>
                <div className="badge">ROI</div>
              </div>

              <ul className="results-grid">
                <li>
                  <p className="result-label">Potencia del sistema</p>
                  <p className="result-value">{result.system_size_kw} kW</p>
                  <p className="result-hint">Capacidad nominal para cubrir tu consumo promedio.</p>
                </li>
                <li>
                  <p className="result-label">Número de paneles (550 W)</p>
                  <p className="result-value">{result.panel_count}</p>
                  <p className="result-hint">Cantidad estimada de módulos necesarios.</p>
                </li>
                <li>
                  <p className="result-label">Ahorro mensual</p>
                  <p className="result-value">{formatCurrency(result.monthly_savings_cop)}</p>
                  <p className="result-hint">Reducción esperada en tu factura de energía.</p>
                </li>
                <li>
                  <p className="result-label">Costo de instalación</p>
                  <p className="result-value">{formatCurrency(result.installation_cost_cop)}</p>
                  <p className="result-hint">Inversión aproximada considerando equipos y montaje.</p>
                </li>
                <li>
                  <p className="result-label">Área requerida</p>
                  <p className="result-value">{result.area_m2} m²</p>
                  <p className="result-hint">Superficie mínima recomendada para los paneles.</p>
                </li>
              </ul>
            </>
          ) : (
            <div className="placeholder">
              <p className="lead">Comienza ingresando tu consumo mensual.</p>
              <p className="supporting-text">
                Calcularemos potencia, número de paneles, inversión y ahorro para
                que tomes decisiones informadas.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="card assumptions">
        <div className="assumptions__header">
          <p className="title-label">Supuestos del modelo</p>
          <h3>Contexto que guía los resultados</h3>
        </div>
        <div className="assumptions__grid">
          <div className="assumption">
            <p className="assumption__label">Potencia por panel</p>
            <p className="assumption__value">{PANEL_POWER_W} W</p>
          </div>
          <div className="assumption">
            <p className="assumption__label">Tarifa de energía</p>
            <p className="assumption__value">
              {formatNumber(ENERGY_PRICE_COP_PER_KWH)} COP/kWh
            </p>
          </div>
          <div className="assumption">
            <p className="assumption__label">Horas solares pico</p>
            <p className="assumption__value">{formatNumber(SUN_HOURS_PER_DAY)} h/día</p>
          </div>
          <div className="assumption">
            <p className="assumption__label">Relación de rendimiento</p>
            <p className="assumption__value">{formatNumber(PERFORMANCE_RATIO)}</p>
          </div>
          <div className="assumption">
            <p className="assumption__label">Costo por panel</p>
            <p className="assumption__value">{formatCurrency(PANEL_COST_COP)}</p>
          </div>
          <div className="assumption">
            <p className="assumption__label">Área por panel</p>
            <p className="assumption__value">{formatNumber(PANEL_AREA_M2)} m²</p>
          </div>
        </div>
        <p className="supporting-text">
          Estos valores siguen las guías de Material Design 3 para presentar
          datos técnicos de forma legible, con énfasis en jerarquía y contraste.
        </p>
      </section>
    </div>
  );
}

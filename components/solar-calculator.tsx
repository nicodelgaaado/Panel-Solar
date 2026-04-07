"use client";

import { type FormEvent, useState, useTransition } from "react";
import {
  BadgeDollarSign,
  Bolt,
  Leaf,
  LineChart,
  Map,
  SunMedium,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  calculateSolarSizing,
  consumptionPresets,
  solarAssumptions,
  type SolarCalculationResult,
} from "@/lib/solar";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

const metricCards = (result: SolarCalculationResult) => [
  {
    icon: Bolt,
    label: "Potencia requerida",
    value: `${numberFormatter.format(result.systemSizeKw)} kW`,
    hint: "Capacidad nominal para cubrir tu consumo promedio.",
  },
  {
    icon: SunMedium,
    label: "Paneles de 550 W",
    value: numberFormatter.format(result.panelCount),
    hint: "Cantidad aproximada de modulos.",
  },
  {
    icon: BadgeDollarSign,
    label: "Ahorro mensual",
    value: currencyFormatter.format(result.monthlySavingsCop),
    hint: "Reduccion estimada de la factura.",
  },
  {
    icon: LineChart,
    label: "Retorno estimado",
    value: `${numberFormatter.format(result.paybackYears)} anos`,
    hint: "Tiempo aproximado para recuperar la inversion.",
  },
  {
    icon: Map,
    label: "Area requerida",
    value: `${numberFormatter.format(result.areaM2)} m2`,
    hint: "Superficie util sugerida para instalar.",
  },
  {
    icon: Leaf,
    label: "Generacion anual",
    value: `${numberFormatter.format(result.annualGenerationKwh)} kWh`,
    hint: "Produccion esperada en un ano promedio.",
  },
] as const;

const heroHighlights = [
  {
    label: "Radiacion util",
    value: `${numberFormatter.format(solarAssumptions.sunHoursPerDay)} h`,
    hint: "Horas solares pico por dia.",
  },
  {
    label: "Rendimiento",
    value: `${solarAssumptions.performanceRatio * 100}%`,
    hint: "Perdidas globales consideradas.",
  },
  {
    label: "Panel estandar",
    value: `${solarAssumptions.panelPowerW} W`,
    hint: "Potencia de referencia por modulo.",
  },
] as const;

const modelFacts = [
  {
    label: "Potencia por panel",
    value: `${solarAssumptions.panelPowerW} W`,
  },
  {
    label: "Tarifa de energia",
    value: `${numberFormatter.format(solarAssumptions.energyPriceCopPerKwh)} COP/kWh`,
  },
  {
    label: "Horas solares pico",
    value: `${numberFormatter.format(solarAssumptions.sunHoursPerDay)} h/dia`,
  },
  {
    label: "Relacion de rendimiento",
    value: numberFormatter.format(solarAssumptions.performanceRatio),
  },
  {
    label: "Costo por panel",
    value: currencyFormatter.format(solarAssumptions.panelCostCop),
  },
  {
    label: "Area por panel",
    value: `${numberFormatter.format(solarAssumptions.panelAreaM2)} m2`,
  },
] as const;

export function SolarCalculator() {
  const [monthlyKwh, setMonthlyKwh] = useState("400");
  const [result, setResult] = useState<SolarCalculationResult>(() =>
    calculateSolarSizing(400)
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function runCalculation(value: number) {
    startTransition(() => {
      setResult(calculateSolarSizing(value));
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedValue = Number(monthlyKwh);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError("Ingresa un consumo mensual mayor a cero.");
      return;
    }

    runCalculation(parsedValue);
  }

  function applyPreset(value: number) {
    setMonthlyKwh(String(value));
    setError("");
    runCalculation(value);
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.09),transparent_42%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <section className="animate-in slide-in-from-bottom-4 rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-none backdrop-blur-sm duration-500 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="w-fit border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                Simulacion residencial
              </Badge>
              <div className="space-y-2">
                <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-emerald-950 sm:text-4xl lg:text-[2.55rem]">
                  Calcula tamano, inversion y retorno de tu sistema solar.
                </h1>
                <p className="max-w-2xl text-sm leading-5 text-emerald-900/80 sm:text-base">
                  Ingresa tu consumo mensual y revisa potencia, paneles, costo,
                  ahorro y retorno en una sola vista.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-2.5"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-800/70">
                    {item.label}
                  </p>
                  <p className="mt-1 font-heading text-2xl leading-none text-emerald-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-4 text-emerald-900/70">
                    {item.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[0.84fr_1.16fr]">
          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader className="gap-2 pb-4">
              <CardTitle className="font-heading text-xl text-emerald-950">
                Calculadora solar
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Ejecuta la simulacion con tu consumo mensual promedio en kWh.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-2.5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="monthly-kwh"
                    className="text-sm font-medium text-emerald-950"
                  >
                    Consumo mensual
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="monthly-kwh"
                      type="number"
                      min="1"
                      step="any"
                      inputMode="decimal"
                      placeholder="Ej. 400"
                      value={monthlyKwh}
                      onChange={(event) => setMonthlyKwh(event.target.value)}
                      className="h-10 border-emerald-200 bg-white text-sm"
                    />
                    <Button
                      type="submit"
                      className="h-10 bg-emerald-700 px-4 text-white hover:bg-emerald-800 sm:min-w-32"
                    >
                      {isPending ? "Calculando..." : "Calcular"}
                    </Button>
                  </div>
                  <p className="text-xs text-emerald-900/70">
                    Tarifa usada:{" "}
                    {numberFormatter.format(
                      solarAssumptions.energyPriceCopPerKwh
                    )}{" "}
                    COP/kWh.
                  </p>
                </div>
              </form>

              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-950">
                  Presets rapidos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {consumptionPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant="outline"
                      onClick={() => applyPreset(preset.value)}
                      className="h-7 border-emerald-200 bg-emerald-50 px-2.5 text-xs text-emerald-900 hover:bg-emerald-100"
                    >
                      {preset.label}: {preset.value} kWh
                    </Button>
                  ))}
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="rounded-2xl border border-emerald-200 bg-emerald-700 px-4 py-3.5 text-emerald-50">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/80">
                  Inversion aproximada
                </p>
                <p className="mt-2 font-heading text-3xl leading-none">
                  {currencyFormatter.format(result.installationCostCop)}
                </p>
                <p className="mt-1.5 max-w-sm text-xs leading-5 text-emerald-100/85">
                  Estimada con {result.panelCount} paneles, instalacion y
                  montaje residencial promedio.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader className="gap-2 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-900">
                  Resultado estimado
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-white text-emerald-800"
                >
                  Base mensual: {monthlyKwh || "0"} kWh
                </Badge>
              </div>
              <CardTitle className="font-heading text-xl text-emerald-950">
                Proyeccion tecnica y financiera
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Lectura rapida para validar tamano del sistema, costo y retorno.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {metricCards(result).map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-2.5"
                    >
                      <div className="flex items-center gap-2 text-emerald-900/75">
                        <Icon className="size-4 text-emerald-700" />
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em]">
                          {metric.label}
                        </p>
                      </div>
                      <p className="mt-1.5 font-heading text-[1.65rem] leading-none text-emerald-950">
                        {metric.value}
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-emerald-900/70">
                        {metric.hint}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-emerald-100" />

              <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-900/70">
                    ROI aproximado
                  </p>
                  <p className="mt-2 font-heading text-4xl leading-none text-emerald-950">
                    {numberFormatter.format(result.paybackYears)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-900/70">
                    anos para recuperar la inversion inicial.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-900/70">
                    Lectura rapida
                  </p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/85">
                    Un consumo de {monthlyKwh || "0"} kWh/mes exige un sistema de{" "}
                    {numberFormatter.format(result.systemSizeKw)} kW, con{" "}
                    {result.panelCount} paneles y un ahorro mensual cercano a{" "}
                    {currencyFormatter.format(result.monthlySavingsCop)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-emerald-950">
                Supuestos del calculo
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Parametros usados para dimensionar el sistema residencial.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {modelFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3"
                >
                  <p className="text-xs text-emerald-900/70">{fact.label}</p>
                  <p className="mt-1.5 font-heading text-xl text-emerald-950">
                    {fact.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

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
  CardFooter,
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
    hint: "Capacidad nominal estimada para cubrir tu consumo promedio.",
  },
  {
    icon: SunMedium,
    label: "Paneles de 550 W",
    value: numberFormatter.format(result.panelCount),
    hint: "Cantidad aproximada de modulos para el arreglo solar.",
  },
  {
    icon: BadgeDollarSign,
    label: "Ahorro mensual",
    value: currencyFormatter.format(result.monthlySavingsCop),
    hint: "Reduccion estimada de la factura electrica.",
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
    hint: "Superficie util sugerida para instalar los paneles.",
  },
  {
    icon: Leaf,
    label: "Generacion anual",
    value: `${numberFormatter.format(result.annualGenerationKwh)} kWh`,
    hint: "Produccion esperada del sistema durante un ano promedio.",
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
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <Badge
              variant="outline"
              className="mb-3 border-emerald-200 bg-emerald-50 text-emerald-800"
            >
              Simulacion residencial
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-emerald-950 sm:text-4xl lg:text-5xl">
                Dimensiona tu sistema solar con una interfaz simple y enfocada
                en eficiencia.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-emerald-900/80 sm:text-base">
                Ingresa tu consumo mensual y obten una estimacion compacta de
                potencia, paneles, ahorro, inversion y retorno.
              </p>
            </div>
          </div>

          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-emerald-950">
                Resumen del modelo
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Supuestos base para una simulacion residencial rapida.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-800/70">
                  Radiacion util
                </p>
                <p className="mt-1.5 font-heading text-2xl text-emerald-950">
                  {numberFormatter.format(solarAssumptions.sunHoursPerDay)} h
                </p>
                <p className="mt-1 text-xs text-emerald-900/70">
                  Horas solares pico por dia.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-800/70">
                  Rendimiento
                </p>
                <p className="mt-1.5 font-heading text-2xl text-emerald-950">
                  {solarAssumptions.performanceRatio * 100}%
                </p>
                <p className="mt-1 text-xs text-emerald-900/70">
                  Perdidas globales ya consideradas.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-800/70">
                  Panel estandar
                </p>
                <p className="mt-1.5 font-heading text-2xl text-emerald-950">
                  550 W
                </p>
                <p className="mt-1 text-xs text-emerald-900/70">
                  Potencia de referencia por modulo.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-emerald-950">
                Calculadora solar
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Ejecuta la simulacion con tu consumo mensual promedio en kWh.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="monthly-kwh"
                    className="text-sm font-medium text-emerald-950"
                  >
                    Consumo mensual
                  </label>
                  <div className="flex gap-3">
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
                      className="h-10 bg-emerald-700 px-4 text-white hover:bg-emerald-800"
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
                <div className="flex flex-wrap gap-2">
                  {consumptionPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant="outline"
                      onClick={() => applyPreset(preset.value)}
                      className="h-8 border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
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

              <div className="rounded-xl border border-emerald-200 bg-emerald-700 px-4 py-4 text-emerald-50">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/80">
                  Inversion aproximada
                </p>
                <p className="mt-2 font-heading text-3xl leading-none">
                  {currencyFormatter.format(result.installationCostCop)}
                </p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-emerald-100/85">
                  Calculada con {result.panelCount} paneles, instalacion
                  estimada y montaje residencial promedio.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 border-t border-emerald-100 bg-emerald-50/50">
              <p className="text-sm font-medium text-emerald-950">
                Resultado inmediato
              </p>
              <p className="text-xs text-emerald-900/70">
                Ajusta el consumo y compara escenarios en segundos.
              </p>
            </CardFooter>
          </Card>

          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader className="gap-2">
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
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {metricCards(result).map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"
                    >
                      <div className="flex items-center gap-2 text-emerald-900/75">
                        <Icon className="size-4 text-emerald-700" />
                        <p className="text-xs font-medium uppercase tracking-[0.12em]">
                          {metric.label}
                        </p>
                      </div>
                      <p className="mt-2 font-heading text-2xl leading-none text-emerald-950">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-emerald-900/70">
                        {metric.hint}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Separator className="bg-emerald-100" />

              <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-4">
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
                <div className="rounded-xl border border-emerald-200 bg-white p-4">
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

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-card shadow-none duration-500">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-emerald-950">
                Supuestos del calculo
              </CardTitle>
              <CardDescription className="text-sm text-emerald-900/70">
                Parametros usados para dimensionar el sistema residencial.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {modelFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"
                >
                  <p className="text-xs text-emerald-900/70">{fact.label}</p>
                  <p className="mt-1.5 font-heading text-xl text-emerald-950">
                    {fact.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="animate-in slide-in-from-bottom-4 border-emerald-100 bg-emerald-900 text-emerald-50 shadow-none duration-500">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Enfoque sostenible
              </CardTitle>
              <CardDescription className="text-emerald-100/75">
                Una lectura clara para revisar consumo, inversion y ahorro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-emerald-50/90">
              <p>
                El diseno prioriza una visual compacta, menos decorativa y mas
                enfocada en lectura rapida.
              </p>
              <p>
                Los componentes principales usan una paleta verde para reforzar
                el caracter ecologico del simulador.
              </p>
            </CardContent>
            <CardFooter className="border-t border-emerald-800 bg-emerald-900">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-800 text-emerald-50">Consumo</Badge>
                <Badge className="bg-emerald-800 text-emerald-50">Ahorro</Badge>
                <Badge className="bg-emerald-800 text-emerald-50">Retorno</Badge>
                <Badge className="bg-emerald-800 text-emerald-50">Area</Badge>
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}

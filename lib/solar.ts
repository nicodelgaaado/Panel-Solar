export const solarAssumptions = {
  sunHoursPerDay: 5,
  performanceRatio: 0.8,
  panelPowerW: 550,
  panelCostCop: 2_100_000,
  energyPriceCopPerKwh: 926,
  panelAreaM2: 2.1,
  monthDays: 30,
} as const;

export type SolarCalculationResult = {
  systemSizeKw: number;
  panelCount: number;
  monthlySavingsCop: number;
  installationCostCop: number;
  paybackYears: number;
  areaM2: number;
  annualGenerationKwh: number;
};

const round = (value: number) => Math.round(value * 100) / 100;

export function calculateSolarSizing(monthlyKwh: number): SolarCalculationResult {
  if (!Number.isFinite(monthlyKwh) || monthlyKwh <= 0) {
    throw new Error("El consumo mensual debe ser mayor a cero.");
  }

  const dailyKwh = monthlyKwh / solarAssumptions.monthDays;
  const effectiveDailyOutput =
    solarAssumptions.sunHoursPerDay * solarAssumptions.performanceRatio;

  if (effectiveDailyOutput <= 0) {
    throw new Error("Los parámetros del modelo son inválidos.");
  }

  const systemSizeKw = dailyKwh / effectiveDailyOutput;
  const rawPanelCount = (systemSizeKw * 1000) / solarAssumptions.panelPowerW;
  const panelCount = Math.max(1, Math.ceil(rawPanelCount));
  const monthlySavingsCop = monthlyKwh * solarAssumptions.energyPriceCopPerKwh;
  const installationCostCop = panelCount * solarAssumptions.panelCostCop;
  const annualSavingsCop = monthlySavingsCop * 12;
  const paybackYears = installationCostCop / annualSavingsCop;
  const areaM2 = panelCount * solarAssumptions.panelAreaM2;
  const annualGenerationKwh =
    systemSizeKw *
    solarAssumptions.sunHoursPerDay *
    solarAssumptions.performanceRatio *
    365;

  return {
    systemSizeKw: round(systemSizeKw),
    panelCount,
    monthlySavingsCop: round(monthlySavingsCop),
    installationCostCop: round(installationCostCop),
    paybackYears: round(paybackYears),
    areaM2: round(areaM2),
    annualGenerationKwh: round(annualGenerationKwh),
  };
}

export const consumptionPresets = [
  { label: "Apartamento", value: 250 },
  { label: "Casa media", value: 400 },
  { label: "Casa amplia", value: 650 },
] as const;

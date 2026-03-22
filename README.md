# Panel Solar

Aplicación web construida con Next.js, TypeScript, Tailwind CSS v4 y shadcn/ui para estimar el dimensionamiento de un sistema solar residencial.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Framework preset: `Next.js`.
3. Build command: `npm run build`.
4. Output setting: dejar el valor por defecto de Next.js.

No se necesita backend en Python ni variables de entorno para ejecutar la simulación base.

## Lógica del simulador

El cálculo usa estos supuestos:

- Horas solares pico: `5 h/día`
- Relación de rendimiento: `0.8`
- Potencia por panel: `550 W`
- Costo por panel: `2,100,000 COP`
- Precio de energía: `926 COP/kWh`
- Área por panel: `2.1 m²`

La lógica vive en [`lib/solar.ts`](/c:/Users/Nlicolas/Panel-Solar/lib/solar.ts).

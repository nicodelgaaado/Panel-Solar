import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Panel Solar",
  description:
    "Calcula el tamano, costo, ahorro y retorno estimado de un sistema solar residencial desde una sola aplicacion web.",
  applicationName: "Panel Solar",
  openGraph: {
    title: "Panel Solar",
    description: "Simulador web para dimensionar una instalacion solar residencial.",
    siteName: "Panel Solar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitializationScript = `
  (function () {
    try {
      const storedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      const shouldUseDark =
        storedTheme === "dark" ||
        (!storedTheme && systemPrefersDark);

      document.documentElement.classList.toggle(
        "dark",
        shouldUseDark
      );
    } catch (error) {
      console.error("Unable to initialize theme:", error);
    }
  })();
`;

export const metadata: Metadata = {
  title: {
    default: "Finanzas",
    template: "%s | Finanzas",
  },
  description:
    "Panel personal para administrar tarjetas, viajes, presupuestos y gastos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitializationScript,
          }}
        />
      </head>

      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
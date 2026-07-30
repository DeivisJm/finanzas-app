import type { Metadata, Viewport } from "next";
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
    default: "Wallet Pro",
    template: "%s | Wallet Pro",
  },

  applicationName: "Wallet Pro",

  description:
    "Aplicación personal para organizar proyectos, tarjetas, viajes y gastos.",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    title: "Wallet Pro",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Wallet Pro",
    title: "Wallet Pro",
    description:
      "Organizá proyectos, tarjetas, viajes y gastos desde un solo lugar.",
  },

  twitter: {
    card: "summary",
    title: "Wallet Pro",
    description:
      "Organizá proyectos, tarjetas, viajes y gastos desde un solo lugar.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",

  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f7f7f8",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#09090b",
    },
  ],
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
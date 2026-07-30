import type { MetadataRoute } from "next";

/**
 * Defines the installation configuration for Wallet Pro.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Wallet Pro",
    short_name: "Wallet Pro",
    description:
      "Aplicación personal para organizar proyectos, tarjetas, viajes y gastos.",

    start_url: "/",
    scope: "/",

    display: "standalone",
    orientation: "portrait-primary",

    background_color: "#09090b",
    theme_color: "#2563eb",

    lang: "es",

    categories: [
      "finance",
      "productivity",
      "utilities",
    ],

    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
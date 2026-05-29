"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  MapPin,
  Clock3,
  Plus,
  Receipt,
  Sparkles,
} from "lucide-react";

interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  createdAt: string;
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ubicacion, setUbicacion] = useState("Obteniendo ubicación...");
  const [darkMode, setDarkMode] = useState(false);

  const cargarGastos = async () => {
    const res = await fetch("/api/gastos");
    const data = await res.json();

    setGastos(data);
  };

  useEffect(() => {
    cargarGastos();

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    setDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener("change", (e) => {
      setDarkMode(e.matches);
    });

    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
          );

          const data = await res.json();

          setUbicacion(
            data.address.city ||
              data.address.town ||
              data.address.village ||
              "Ubicación desconocida"
          );
        } catch {
          setUbicacion("Ubicación no disponible");
        }
      },
      () => {
        setUbicacion("Permiso denegado");
      }
    );
  };

  const agregarGasto = async () => {
    if (!texto) return;

    await fetch("/api/gastos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto,
      }),
    });

    setTexto("");

    cargarGastos();
  };

  const total = gastos.reduce(
    (acc, gasto) => acc + gasto.monto,
    0
  );

  return (
    <main
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-black text-white"
          : "bg-zinc-100 text-black"
      }`}
    >
      <div className="max-w-2xl mx-auto p-5 pb-32">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 p-3 rounded-2xl shadow-lg">
              <Wallet size={30} className="text-white" />
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight">
                Finanzas
              </h1>

              <p className="opacity-60">
                Control inteligente de gastos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 opacity-70 text-sm">
            <MapPin size={16} />
            <span>{ubicacion}</span>
          </div>
        </div>

        <div
          className={`rounded-[32px] p-6 mb-7 backdrop-blur-xl border shadow-2xl ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-green-500" />
            <h2 className="font-bold text-xl">
              Registrar gasto
            </h2>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ej: gasté 5000 en gasolina"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className={`flex-1 p-5 rounded-2xl outline-none transition-all ${
                darkMode
                  ? "bg-zinc-900 border border-zinc-800"
                  : "bg-zinc-100 border border-zinc-300"
              }`}
            />

            <button
              onClick={agregarGasto}
              className="bg-green-500 hover:bg-green-600 active:scale-95 transition-all px-6 rounded-2xl shadow-xl"
            >
              <Plus className="text-white" />
            </button>
          </div>
        </div>

        <div
          className={`rounded-[32px] p-7 mb-7 shadow-2xl border ${
            darkMode
              ? "bg-gradient-to-br from-green-500/20 to-emerald-700/10 border-green-500/20"
              : "bg-gradient-to-br from-green-100 to-white border-green-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Receipt className="text-green-500" />
            <h2 className="text-2xl font-bold">
              Total gastado
            </h2>
          </div>

          <p className="text-6xl font-black text-green-500 tracking-tight">
            ₡{total.toLocaleString()}
          </p>
        </div>

        <div className="space-y-5">
          {gastos.map((gasto) => {
            const fecha = new Date(gasto.createdAt);

            return (
              <div
                key={gasto.id}
                className={`rounded-[30px] p-5 border shadow-xl transition-all hover:scale-[1.01] ${
                  darkMode
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {gasto.descripcion}
                    </h3>

                    <div className="flex items-center gap-2 opacity-60 text-sm">
                      <Clock3 size={15} />

                      <span>
                        {fecha.toLocaleDateString("es-CR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>

                      <span>•</span>

                      <span>
                        {fecha.toLocaleTimeString("es-CR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-red-500">
                      -₡{gasto.monto.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
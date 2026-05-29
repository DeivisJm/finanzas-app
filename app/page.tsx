"use client";

import { useEffect, useState } from "react";

interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);

  const cargarGastos = async () => {
    const res = await fetch("/api/gastos");
    const data = await res.json();

    setGastos(data);
  };

  useEffect(() => {
    cargarGastos();
  }, []);

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
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          Finanzas Personales
        </h1>

        <p className="text-zinc-400 mb-8">
          Registra tus gastos por voz o texto.
        </p>

        <div className="bg-zinc-900 p-4 rounded-2xl mb-6">
          <input
            type="text"
            placeholder="Ej: gasté 5000 colones en gasolina"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 outline-none mb-4"
          />

          <button
            onClick={agregarGasto}
            className="w-full bg-white text-black p-4 rounded-xl font-semibold cursor-pointer hover:opacity-80"
          >
            Guardar gasto
          </button>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Total gastado
          </h2>

          <p className="text-4xl font-bold text-green-400">
            ₡{total.toLocaleString()}
          </p>
        </div>

        <div className="space-y-4">
          {gastos.map((gasto) => (
            <div
              key={gasto.id}
              className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center"
            >
              <p className="font-semibold">
                {gasto.descripcion}
              </p>

              <p className="text-red-400 font-bold">
                - ₡{gasto.monto.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
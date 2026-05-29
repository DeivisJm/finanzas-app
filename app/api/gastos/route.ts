import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const gastos = await prisma.gasto.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(gastos);
}

export async function POST(req: Request) {
  const body = await req.json();

  const texto = body.texto;

  const numeros = texto.match(/\d+/);

  const monto = numeros ? parseInt(numeros[0]) : 0;

  const descripcion = texto
    .replace(/\d+/g, "")
    .replace("colones", "")
    .replace("en", "")
    .trim();

  const gasto = await prisma.gasto.create({
    data: {
      descripcion,
      monto,
    },
  });

  return NextResponse.json(gasto);
}
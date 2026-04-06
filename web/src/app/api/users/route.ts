import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Globalny pobierak wszystkich uzytkownikow pod dropodown Oauth. Zeby w MVP moc dodawac kolegow na test.
  const users = await prisma.user.findMany({
    select: { id: true, name: true, image: true, email: true }
  });
  return NextResponse.json(users);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSyncUser } from "@/lib/clerk-sync";

export async function POST(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { getFinaleAirDate } = require("@/lib/tmdb");

  const body = await req.json();
  const { tmdb_id, title, poster_path, status } = body;

  try {
    const finaleDate = await getFinaleAirDate(tmdb_id);

    const series = await prisma.seriesCache.upsert({
      where: { tmdb_id },
      update: { 
        title, poster_path, status,
        next_ep_air_date: finaleDate !== null ? finaleDate : undefined
      },
      create: { 
        tmdb_id, title, poster_path, status,
        next_ep_air_date: finaleDate !== null ? finaleDate : null
      }
    });

    await prisma.userSeries.create({
      data: {
        userId: user.id,
        tmdb_id: series.tmdb_id
      }
    });

    return NextResponse.json({ success: true, series });
  } catch (error) {
    return NextResponse.json({ error: "Serial już jest śledzony lub wystąpił błąd." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const archived = url.searchParams.get("archived") === "true";

  const myList = await prisma.userSeries.findMany({
    where: { userId: user.id, is_archived: archived },
    include: { seriesCache: true },
    orderBy: { seriesCache: { next_ep_air_date: { sort: 'asc', nulls: 'last' } } }
  });

  return NextResponse.json(myList);
}

export async function PATCH(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tmdb_id, restore } = await req.json();
  
  await prisma.userSeries.update({
    where: { userId_tmdb_id: { userId: user.id, tmdb_id } },
    data: { is_archived: restore ? false : true }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getSyncUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const tmdb_id = parseInt(searchParams.get("tmdb_id") || "0");
  if (!tmdb_id) return NextResponse.json({ error: "Brak tmdb_id" }, { status: 400 });

  await prisma.userSeries.deleteMany({
    where: { userId: user.id, tmdb_id }
  });

  return NextResponse.json({ success: true });
}

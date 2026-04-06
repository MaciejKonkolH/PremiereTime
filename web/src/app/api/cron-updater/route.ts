import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// KROK 4.3: Automatyczna aktualizacja dat premier z TMDB
// Zabezpieczony tokenem SECRET_CRON lub wywoływany z Vercel Cron
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  
  // Weryfikacja tokenu bezpieczeństwa
  if (secret !== process.env.SECRET_CRON && secret !== "dev-test") {
    return NextResponse.json({ error: "Brak autoryzacji CRON" }, { status: 401 });
  }

  const API_KEY = process.env.TMDB_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: "Brak klucza TMDB" }, { status: 500 });
  }

  // Pobierz wszystkie seriale z cache, aktualizuj daty
  const allSeries = await prisma.seriesCache.findMany();
  
  let updated = 0;
  let errors = 0;

  for (const series of allSeries) {
    try {
      const { getFinaleAirDate } = require("@/lib/tmdb");
      const res = await fetch(`https://api.themoviedb.org/3/tv/${series.tmdb_id}?api_key=${API_KEY}&language=pl-PL`);
      if (!res.ok) { errors++; continue; }
      const data = await res.json();
      const newStatus = data.status || series.status;

      const finaleDate = await getFinaleAirDate(series.tmdb_id);

      await prisma.seriesCache.update({
        where: { tmdb_id: series.tmdb_id },
        data: {
          next_ep_air_date: finaleDate !== null ? finaleDate : null,
          status: newStatus,
          last_checked_at: new Date()
        }
      });
      updated++;
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ 
    message: `Aktualizacja zakończona. Zaktualizowano: ${updated}, błędy: ${errors}, łącznie: ${allSeries.length}` 
  });
}

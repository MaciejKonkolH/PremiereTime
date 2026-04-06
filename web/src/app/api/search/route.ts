import { NextResponse } from "next/server";
import axios from "axios";
import { getSyncUser } from "@/lib/clerk-sync";

const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/tv";

export async function GET(request: Request) {
  try {
    const user = await getSyncUser();
    if (!user) {
      return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const response = await axios.get(TMDB_SEARCH_URL, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: query,
        language: "pl-PL",
        include_adult: false,
      },
    });

    const results = response.data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      poster_path: item.poster_path,
      first_air_date: item.first_air_date,
      overview: item.overview,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("TMDB Search Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Błąd podczas przeszukiwania bazy TMDB" },
      { status: 500 }
    );
  }
}

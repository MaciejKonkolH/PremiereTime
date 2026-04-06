export async function getFinaleAirDate(tmdb_id: number): Promise<Date | null> {
  const url = `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${process.env.TMDB_API_KEY}&language=pl-PL`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    
    // Eliminujemy Sezon 0 (Odcinki Specjalne)
    const seasons = json.seasons?.filter((s:any) => s.season_number > 0) || [];
    if (seasons.length === 0) return null;
    
    // Sortuj, żeby złapać odcinek z ostatnią częścią najnowszego sezonu.
    const latestSeason = seasons.sort((a:any, b:any) => b.season_number - a.season_number)[0];
    if (!latestSeason) return null;

    // Pobierz listę odcinków najnowszego / nadchodzącego sezonu.
    const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}/season/${latestSeason.season_number}?api_key=${process.env.TMDB_API_KEY}&language=pl-PL`);
    if (!seasonRes.ok) return null;
    const seasonData = await seasonRes.json();

    if (seasonData.episodes && seasonData.episodes.length > 0) {
      // Wyławiamy fizycznie najodleglejszą datę (będzie to FINAŁ sezonu)
      const validEpisodes = seasonData.episodes.filter((e:any) => !!e.air_date);
      if (validEpisodes.length > 0) {
         const finalEp = validEpisodes.sort((a:any, b:any) => new Date(b.air_date).getTime() - new Date(a.air_date).getTime())[0];
         if (finalEp && finalEp.air_date) {
            return new Date(finalEp.air_date);
         }
      }
    }

    // Droga ratunkowa - gdy finału jeszcze nie zaplanowano, bierzemy last_episode lub next_episode
    if (json.next_episode_to_air?.air_date) return new Date(json.next_episode_to_air.air_date);
    if (json.last_episode_to_air?.air_date) return new Date(json.last_episode_to_air.air_date);
    
    return null;
  } catch(e) {
    return null;
  }
}

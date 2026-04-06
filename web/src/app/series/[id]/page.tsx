import Navbar from "@/components/Navbar";
import { Calendar } from "lucide-react";
import ClientActions from "./ClientActions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SeriesPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ ws?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const tmdb_id = resolvedParams.id;
  
  let workspaceName = "Ekipy";
  if (resolvedSearch.ws) {
    const ws = await prisma.workspace.findUnique({ where: { id: resolvedSearch.ws } });
    if (ws) workspaceName = ws.workspace_name;
  }

  // Bezpośredni call uderzający z bezpieczengo serwera Next.js do TMDB
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${process.env.TMDB_API_KEY}&language=pl-PL`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    return <div className="text-white mt-32 text-center text-2xl font-bold bg-[#090b14] h-screen pt-40">Błąd podczas pobierania archiwów Hollywood. Wróć <Link className="text-blue-500 underline" href="/">TUTAJ</Link></div>;
  }
  const data = await res.json();
  
  const { getFinaleAirDate } = require("@/lib/tmdb");
  const trueFinale = await getFinaleAirDate(parseInt(tmdb_id));
  const airDate = trueFinale ? trueFinale.toISOString().split('T')[0] : "Brak ustalonej daty";
  const formattedAirDate = airDate !== "Brak ustalonej daty" ? new Date(airDate).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }) : airDate;
  const desc = data.overview || "Ten serial jest tak utajniony, że na chwię obecną nie ma jeszcze oficjalnego opisu w języku polskim w portalu TheMovieDB.";

  return (
    <div className="relative min-h-screen bg-[#090b14]">
       <Navbar />
       
       <div className="fixed top-0 left-0 w-full h-[65vh] z-0 overflow-hidden pointer-events-none opacity-40">
         <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/50 to-transparent z-10" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#090b14]/80 to-transparent z-10" />
         <img src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`} className="w-full h-full object-cover grayscale opacity-50 blur-[3px]" alt="" />
       </div>

       <main className="relative z-10 max-w-5xl mx-auto px-6 pt-[140px] pb-24 flex flex-col md:flex-row gap-12">
         {/* Lewa kolumna: Poster i Action */}
         <div className="w-full md:w-[320px] shrink-0 md:sticky md:top-[120px] flex flex-col gap-6 relative z-50">
           <img src={`https://image.tmdb.org/t/p/w500${data.poster_path}`} className="w-full max-w-[300px] mx-auto md:max-w-none rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)]" alt="Okładka" />
           <div className="w-full max-w-[300px] mx-auto md:max-w-none">
             <ClientActions tmdb_id={parseInt(tmdb_id)} workspaceId={resolvedSearch.ws || null} workspaceName={workspaceName} />
           </div>
         </div>

         {/* Prawa kolumna: Detale i tekst */}
         <div className="flex-1 flex flex-col justify-center py-6 relative z-20">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 drop-shadow-md">
              {data.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
               <span className="text-gray-300 bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest border border-white/10 glass-panel">
                 {data.status}
               </span>
               <span className="text-blue-300 bg-blue-900/30 px-4 py-1.5 rounded-full text-sm flex items-center gap-2 border border-blue-500/20 shadow-lg">
                 <Calendar size={16}/> Data: {formattedAirDate}
               </span>
            </div>

            <h3 className="text-xl font-bold text-gray-200 mb-3 border-b border-white/10 pb-2">O serialu</h3>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 text-justify">
              {desc}
            </p>

            <div className="flex gap-4 mb-4">
              {data.genres?.map((g: any) => (
                <span key={g.id} className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                  {g.name}
                </span>
              ))}
            </div>
         </div>
       </main>
    </div>
  )
}

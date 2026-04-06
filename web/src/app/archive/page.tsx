"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArchiveRestore, Layers, SearchX, Users } from "lucide-react";

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState<string>("ME");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [archivedSeries, setArchivedSeries] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/workspace").then(r => r.json()).then(setWorkspaces);
  }, []);

  const fetchArchived = async () => {
    if(activeTab === "ME") {
      const res = await fetch("/api/series?archived=true");
      setArchivedSeries(await res.json());
    } else {
      const res = await fetch(`/api/workspace?id=${activeTab}&archived=true`);
      const wsData = await res.json();
      setArchivedSeries(wsData.series || []);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, [activeTab]);

  const restoreSeries = async (tmdb_id: number) => {
    if(activeTab === "ME") {
      await fetch("/api/series", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id, restore: true })
      });
    } else {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESTORE_SERIES", workspaceId: activeTab, tmdb_id })
      });
    }
    fetchArchived();
  };

  return (
    <div className="relative min-h-screen bg-[#05070e] overflow-hidden">
      {/* Ambient Gradient Glows (Dribbble Like) */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[90px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[110px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[15%] right-[15%] w-[450px] h-[450px] bg-violet-600/25 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[50%] left-[-15%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-[120px] pb-24 relative z-10">
        
        {/* Owalne Tabsy Prawa Strona */}
        <section className="mb-14 flex flex-col md:flex-row items-center justify-end gap-6 relative z-50">
          <div className="flex w-full md:w-auto overflow-x-auto bg-black/30 backdrop-blur-xl rounded-full p-2 border border-white/10 ring-1 ring-inset ring-indigo-500/30 items-center gap-1 shadow-2xl snap-x">
             <button 
                onClick={() => setActiveTab("ME")}
                className={`shrink-0 snap-start py-2 px-5 md:px-6 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === 'ME' ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
             >
                Osobista Tablica
             </button>
             
             {workspaces.map(w => (
                <button 
                  key={w.id}
                  onClick={() => setActiveTab(w.id)}
                  className={`shrink-0 snap-start py-2 px-5 md:px-6 rounded-full text-sm font-bold transition whitespace-nowrap ${activeTab === w.id ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
                >
                   {w.workspace_name}
                </button>
             ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {archivedSeries.length === 0 ? (
               <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2 px-8">
                 <h3 className="text-gray-400 text-xl font-medium mb-3">Archiwum tej strefy jest wciąż puste.</h3>
                 <p className="text-sm text-gray-500 max-w-sm mx-auto">Nic tu nie ma. Oglądaj pozycję i archiwizuj ukończone historie dla porządku na froncie.</p>
               </div>
            ) : (
              archivedSeries.map((item: any) => {
                const title = item.seriesCache?.title;
                const posterPath = item.seriesCache?.poster_path;
                
                return (
                  <div key={item.id} className="rounded-2xl overflow-hidden group relative block transition-transform duration-300 hover:scale-[1.02] aspect-[2/3] bg-black shadow-2xl border border-white/5 grayscale hover:grayscale-0">
                     <img 
                       src={posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "https://via.placeholder.com/500x750?text=Brak+Okładki"} 
                       className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700"
                       alt={title}
                     />
                     <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#05070e] via-[#05070e]/95 to-transparent pt-28 opacity-100 transition flex flex-col justify-end h-full">
                        <h3 className="font-normal uppercase tracking-[0.15em] text-lg mb-4 truncate text-[#f8fafc] drop-shadow-md group-hover:text-[#a855f7] transition" title={title}>{title}</h3>
                        <button 
                          onClick={() => restoreSeries(item.tmdb_id)}
                          className="w-full bg-[#a855f7]/20 hover:bg-[#a855f7]/40 border border-[#a855f7]/50 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-[#f8fafc]"
                        >
                          <ArchiveRestore size={18} /> Przywróć na tablicę
                        </button>
                     </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

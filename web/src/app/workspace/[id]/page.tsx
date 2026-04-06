"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Users, UserPlus, CheckSquare, Film, Search } from "lucide-react";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [workspace, setWorkspace] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);

  const fetchWorkspace = async () => {
    const res = await fetch(`/api/workspace?id=${resolvedParams.id}`);
    const data = await res.json();
    setWorkspace(data);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    setAllUsers(await res.json());
  };

  useEffect(() => {
    fetchWorkspace();
    fetchUsers();
  }, [resolvedParams.id]);

  const addUserToWorkspace = async (userId_to_add: string) => {
    await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_MEMBER", workspaceId: resolvedParams.id, userId_to_add })
    });
    fetchWorkspace();
  };

  const searchTMDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) return setTmdbResults([]);
    const res = await fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`);
    const data = await res.json();
    setTmdbResults(data.results?.slice(0, 5) || []);
  };

  const addSeriesToGroup = async (s: any) => {
    await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ADD_SERIES",
        workspaceId: resolvedParams.id,
        tmdb_id: s.id,
        title: s.name,
        poster_path: s.poster_path,
        status: "Returning Series"
      })
    });
    setTmdbResults([]);
    setQuery("");
    setSearchOpen(false);
    fetchWorkspace();
  };

  const hitTheCompromiseBlade = async (tmdb_id: number) => {
    await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ARCHIVE_SERIES", workspaceId: resolvedParams.id, tmdb_id })
    });
    fetchWorkspace();
  };

  if (!workspace) return <div className="p-20 text-center text-white">Wczytuję pokój...</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-[120px] pb-24">
        
        {/* Header Pokoju */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-6 gap-6">
          <div>
            <span className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1 block">Wspólna Przestrzeń</span>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
              {workspace.workspace_name}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {workspace.members.map((m: any) => (
                  <div key={m.userId} title={m.user.name} className="w-10 h-10 rounded-full border-2 border-[#090b14] bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg overflow-hidden">
                    {m.user.image ? <img src={m.user.image} alt="" className="w-full h-full object-cover"/> : m.user.name?.[0] || "?"}
                  </div>
                ))}
             </div>
             
             {/* Dropdown zapraszania */}
             <div className="relative group">
                <button className="w-10 h-10 rounded-full border border-dashed border-white/30 flex items-center justify-center hover:bg-white/10 transition">
                  <UserPlus size={16} />
                </button>
                <div className="absolute right-0 top-12 w-64 glass-panel p-3 rounded-xl hidden group-hover:block z-50">
                   <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Dołącz użytkownika</h4>
                   {allUsers.filter(u => !workspace.members.find((m: any) => m.userId === u.id)).map(u => (
                      <button key={u.id} onClick={() => addUserToWorkspace(u.id)} className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left text-sm transition">
                        <Users size={14} className="text-blue-400" /> {u.name}
                      </button>
                   ))}
                   {allUsers.filter(u => !workspace.members.find((m: any) => m.userId === u.id)).length === 0 && (
                     <span className="text-xs text-gray-400 p-2 block">Wszyscy użytkownicy są już w pokoju!</span>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Wyszukiwarka pokojowa */}
        <div className="mb-10">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2"
          >
            <Search size={18} /> Dodaj serial do wspólnej tablicy
          </button>

          {searchOpen && (
            <div className="mt-4 relative z-40 max-w-lg">
              <input 
                onChange={searchTMDB}
                value={query}
                placeholder="Szukaj serialu..." 
                className="w-full glass-panel px-5 py-4 pl-12 rounded-xl outline-none text-white focus:border-blue-500 transition"
              />
              <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              
              {tmdbResults.length > 0 && (
                <div className="absolute top-[110%] left-0 w-full bg-[#0b0e17] border border-white/10 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
                  {tmdbResults.map((s) => (
                    <button key={s.id} onClick={() => addSeriesToGroup(s)} className="flex items-center gap-4 p-2 hover:bg-white/10 text-left border-b border-white/5 transition group">
                       <img src={s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "https://via.placeholder.com/92x138?text=!"} className="w-10 h-14 object-cover rounded shadow" alt=""/>
                       <span className="font-bold text-sm text-gray-200 group-hover:text-blue-300 transition-colors">{s.name}</span> 
                       <span className="text-[11px] text-blue-400 ml-auto bg-blue-600/20 px-3 py-1.5 rounded-lg border border-blue-500/30 uppercase tracking-widest font-bold whitespace-nowrap">+ Wspólnie</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tablica Grupy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspace.series.map((item: any) => {
            const epDate = item.seriesCache?.next_ep_air_date;
            return (
            <Link href={`/series/${item.tmdb_id}?workspace=${workspace.id}`} key={item.id} className="glass-panel card-hover-fx rounded-2xl p-5 border border-purple-500/20 cursor-pointer block group">
              <div className="flex gap-4">
                 <div className="w-20 h-28 relative rounded-md overflow-hidden shadow-lg shrink-0">
                    <img src={item.seriesCache?.poster_path ? `https://image.tmdb.org/t/p/w200${item.seriesCache?.poster_path}` : "https://via.placeholder.com/200x300?text=Brak"} className="w-full h-full object-cover group-hover:scale-105 transition" alt=""/>
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-purple-400 transition">{item.seriesCache?.title}</h3>
                    <p className="text-xs text-gray-400 mb-1">Zaproponował: {item.adder?.name}</p>
                    <p className="text-[11px] bg-white/5 py-1 px-2 rounded-md font-bold text-blue-400 inline-block w-fit mt-1">Premiera: {epDate ? new Date(epDate).toLocaleDateString('pl-PL') : "Brak daty"}</p>
                 </div>
              </div>
            </Link>
          )})}
          {workspace.series.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500 italic">Ta tablica jest pusta. Dodaj serial przez wyszukiwarkę powyżej!</div>
          )}
        </div>

      </main>
    </div>
  );
}

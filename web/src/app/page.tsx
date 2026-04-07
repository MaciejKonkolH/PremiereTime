"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Tv, 
  ChevronRight, 
  Layers,
  LogOut,
  Bell,
  Archive,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk, useUser } from "@clerk/nextjs";
import Link from 'next/link';

const PremiereTimeDashboard = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [mySeries, setMySeries] = useState<any[]>([]);
  const [activeBoardData, setActiveBoardData] = useState<any>(null);
  const [defaultBoard, setDefaultBoard] = useState("private");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();

  const fetchWorkspaces = async () => {
    const res = await fetch("/api/workspace");
    if (res.ok) setWorkspaces(await res.json());
  };

  const loadGridData = async (boardId: string) => {
    setIsLoading(true);
    if (boardId === "private") {
      const res = await fetch("/api/series");
      if (res.ok) {
        const data = await res.json();
        setMySeries(sortSeries(data));
      }
      setActiveBoardData(null);
    } else {
      const res = await fetch(`/api/workspace?id=${boardId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          data.series = sortSeries(data.series?.map((s: any) => ({ ...s, seriesCache: s.series })) || []);
          setActiveBoardData(data);
        }
      }
    }
    setIsLoading(false);
  };

  const sortSeries = (series: any[]) => {
    return [...series].sort((a: any, b: any) => {
      const dateA = a.seriesCache?.next_ep_air_date ? new Date(a.seriesCache.next_ep_air_date).getTime() : Infinity;
      const dateB = b.seriesCache?.next_ep_air_date ? new Date(b.seriesCache.next_ep_air_date).getTime() : Infinity;
      return dateA - dateB;
    });
  };

  const getDaysLeft = (dateStr: string | null) => {
    if (!dateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const airDate = new Date(dateStr);
    airDate.setHours(0, 0, 0, 0);
    const diffTime = airDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchWorkspaces();
      const stored = localStorage.getItem("defaultBoard") || "private";
      setDefaultBoard(stored);
      loadGridData(stored);
    }
  }, [isLoaded, isSignedIn]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) return setSearchResults([]);
    const res = await fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`);
    if (res.ok) setSearchResults(await res.json());
  };

  const addToBoard = async (item: any) => {
    const res = await fetch("/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdb_id: item.id,
        title: item.name || item.original_name,
        poster_path: item.poster_path,
        status: item.status || "Unknown"
      })
    });
    if (res.ok) {
      setQuery("");
      setSearchResults([]);
      loadGridData(defaultBoard);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  const currentList = activeBoardData ? activeBoardData.series : mySeries;

  return (
    <div className="min-h-screen bg-[#05060f] text-gray-100 font-sans selection:bg-indigo-500">
      
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-[#05060f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <Tv size={20} className="text-white" />
              </div>
              PREMIERE<span className="text-indigo-500">TIME</span>
            </h1>

            <nav className="hidden md:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
              <button 
                onClick={() => { setDefaultBoard("private"); loadGridData("private"); localStorage.setItem("defaultBoard", "private"); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${defaultBoard === "private" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                Prywatna
              </button>
              {workspaces.map(ws => (
                <button 
                  key={ws.id}
                  onClick={() => { setDefaultBoard(ws.id); loadGridData(ws.id); localStorage.setItem("defaultBoard", ws.id); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${defaultBoard === ws.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                >
                  {ws.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <Link href="/archive" className="p-2 text-gray-400 hover:text-white transition">
                <Archive size={20} />
             </Link>
             <div className="h-6 w-[1px] bg-white/10 mx-2" />
             <img src={user?.imageUrl} className="w-8 h-8 rounded-full border border-white/20 ring-4 ring-indigo-500/10" alt="" />
             <button onClick={() => signOut({ redirectUrl: '/sign-in' })} className="p-2 text-gray-400 hover:text-red-400 transition">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Search Section */}
        <section className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Co dziś śledzimy?</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Search size={20} />
            </div>
            <input 
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Wyszukaj serial i dodaj go do listy..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-gray-600"
            />
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-[#10111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[400px] overflow-y-auto text-left"
                >
                  {searchResults.map((item: any) => (
                    <button 
                      key={item.id}
                      onClick={() => addToBoard(item)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-12 h-16 rounded object-cover shadow-lg" alt="" />
                      <div className="flex-1">
                        <span className="block font-bold">{item.name || item.original_name}</span>
                        <span className="text-xs text-gray-500">{item.first_air_date?.split('-')[0]} • {item.status}</span>
                      </div>
                      <Plus className="text-indigo-500" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Dashboard Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers size={18} className="text-indigo-500" />
              Twoja Kolekcja
            </h3>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              {currentList.length} seriali
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : currentList.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <Tv size={48} className="mx-auto mb-4 text-gray-700" />
                <p className="text-gray-500 font-medium">Brak seriali na tej tablicy. Dodaj coś!</p>
              </div>
            ) : (
              currentList.map((item: any) => {
                const days = getDaysLeft(item.seriesCache?.next_ep_air_date);
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative"
                  >
                    <Link href={`/series/${item.tmdb_id}`}>
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={item.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        
                        {days !== null && (
                          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg backdrop-blur-md border ${
                            days === 0 ? "bg-green-500/90 text-white border-green-400" :
                            days < 7 ? "bg-amber-500/90 text-black border-amber-400" :
                            "bg-black/80 text-white border-white/10"
                          }`}>
                            {days === 0 ? "Premiera dziś" : 
                             days === 1 ? "Jutro" :
                             days < 0 ? "Dostępny" : `Za ${days} dni`}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 px-1">
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                             {item.seriesCache?.next_ep_number ? `S${item.seriesCache.next_ep_season}E${item.seriesCache.next_ep_number}` : 'Koniec Sezonu'}
                           </p>
                           {item.seriesCache?.next_ep_air_date && (
                             <span className="text-[10px] text-gray-600 font-medium">
                               {new Date(item.seriesCache.next_ep_air_date).toLocaleDateString('pl-PL')}
                             </span>
                           )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </main>
      
    </div>
  );
};

export default PremiereTimeDashboard;

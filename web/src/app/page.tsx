"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Search, Plus, Calendar, CheckSquare, Layers, Users, ChevronDown, Pin, Home, UserPlus, Trash2 } from "lucide-react";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mySeries, setMySeries] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultBoard, setDefaultBoard] = useState<string>("private");
  const [isBoardSelectOpen, setIsBoardSelectOpen] = useState(false);
  const [activeBoardData, setActiveBoardData] = useState<any>(null);
  
  // Custom Modal dla Tworzenia Grupy (Bypass Native Prompt Issue)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

  const confirmDeleteWorkspace = async () => {
    if(!workspaceToDelete) return;
    const res = await fetch(`/api/workspace?id=${workspaceToDelete}`, { method: 'DELETE' });
    if(res.ok) {
       setDefaultBoard('private');
       await fetchWorkspaces();
       setWorkspaceToDelete(null);
    } else {
       alert("Ostro... Tylko twórca (owner) pokoju może go skasować!");
       setWorkspaceToDelete(null);
    }
  };

  const fetchWorkspaces = async () => {
    const res = await fetch("/api/workspace");
    if (res.ok) {
      setWorkspaces(await res.json());
    } else {
      console.error("Failed to fetch workspaces", await res.text());
    }
  };

  const fetchMySeries = async () => {
    const res = await fetch("/api/series");
    if (!res.ok) {
       console.error("Failed to fetch series", await res.text());
       return;
    }
    const data = await res.json();
    const sorted = (data.length ? data : []).sort((a: any, b: any) => {
      const dateA = a.seriesCache?.next_ep_air_date ? new Date(a.seriesCache.next_ep_air_date).getTime() : Infinity;
      const dateB = b.seriesCache?.next_ep_air_date ? new Date(b.seriesCache.next_ep_air_date).getTime() : Infinity;
      return dateA - dateB;
    });
    setMySeries(sorted);
  };

  const loadGridData = async (boardId: string) => {
      if (boardId === "private") {
         fetchMySeries();
         setActiveBoardData(null);
      } else {
         const res = await fetch(`/api/workspace?id=${boardId}`);
         if (res.ok) {
            const data = await res.json();
            if (data) {
               const sorted = (data.series?.length ? data.series : []).sort((a: any, b: any) => {
                 const dateA = a.series?.next_ep_air_date ? new Date(a.series.next_ep_air_date).getTime() : Infinity;
                 const dateB = b.series?.next_ep_air_date ? new Date(b.series.next_ep_air_date).getTime() : Infinity;
                 return dateA - dateB;
               });
               data.series = sorted;
               setActiveBoardData(data);
            } else {
               localStorage.setItem("defaultBoard", "private");
               setDefaultBoard("private");
               fetchMySeries();
               setActiveBoardData(null);
            }
         } else {
            // Unikamy blokady jeśli res.ok === false (np. 403 Unauthorized wynikający ze zmodyfikowanego dostępu lub cudzego localStorage)
            localStorage.setItem("defaultBoard", "private");
            setDefaultBoard("private");
            fetchMySeries();
            setActiveBoardData(null);
         }
      }
  };

  useEffect(() => {
    fetchWorkspaces();
    const stored = localStorage.getItem("defaultBoard") || "private";
    setDefaultBoard(stored);
    loadGridData(stored);
  }, []);

  const toggleDefaultBoard = (e: any, id: string) => {
     e.stopPropagation();
     localStorage.setItem("defaultBoard", id);
     setDefaultBoard(id);
     setIsBoardSelectOpen(false);
     loadGridData(id);
  }

  // KROK 4: Wyszukiwanie na serwerach Hollywood
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) return setSearchResults([]);

    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`);
    const data = await res.json();
    setSearchResults(data.results?.slice(0, 5) || []);
    setLoading(false);
  };

  // Dodanie serialu do prywatnej tablicy lub do wspólnego pokoju
  const addSeries = async (s: any, workspaceId: string | null = null) => {
    if(workspaceId) {
       await fetch("/api/workspace", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action: "ADD_SERIES", workspaceId, tmdb_id: s.id, title: s.name, poster_path: s.poster_path, status: "Returning Series" })
       });
    } else {
       await fetch("/api/series", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ tmdb_id: s.id, title: s.name, poster_path: s.poster_path, status: "Returning Series" })
       });
    }
    setSearchResults([]);
    setQuery("");
    loadGridData(defaultBoard);
    fetchWorkspaces();
  };

  // KROK 5.4: Binge Archiwum
  const markAsBinge = async (tmdb_id: number) => {
    await fetch("/api/series", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tmdb_id })
    });
    loadGridData(defaultBoard);
  };

  const openInviteModal = async () => {
    setIsInviteModalOpen(true);
    const res = await fetch("/api/users");
    if(res.ok) {
      const allUsers = await res.json();
      const currentMemberIds = activeBoardData?.members?.map((m: any) => m.userId) || [];
      const notInRoom = allUsers.filter((u: any) => !currentMemberIds.includes(u.id));
      setAvailableUsers(notInRoom);
    }
  };

  const inviteUserById = async (userId: string) => {
     if (defaultBoard === "private") return;
     const res = await fetch("/api/workspace", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ action: "ADD_MEMBER", userId_to_add: userId, workspaceId: defaultBoard })
     });
     if(res.ok) {
        setIsInviteModalOpen(false);
        fetchWorkspaces();
        loadGridData(defaultBoard);
     }
  };

  return (
    <div className="relative min-h-screen bg-[#05070e] overflow-hidden">
      {/* Ambient Gradient Glows (Dribbble Like) */}
      {/* Top Left Cluster */}
      <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-blue-500/20 rounded-full blur-[90px] pointer-events-none mix-blend-screen" />
      
      {/* Top Right Cluster */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      
      {/* Bottom Center & Sides */}
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[110px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[15%] right-[15%] w-[450px] h-[450px] bg-violet-600/25 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[50%] left-[-15%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-[120px] pb-24 relative z-10">
        
        {/* Górna sekcja - Wyszukiwarka i Tabs w jednej linii */}
        <section className="mb-14 flex flex-col md:flex-row items-center justify-between gap-6 relative z-50">
          
          <div className="relative w-full md:w-[60%] lg:w-[45%]">
            <div className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg transition-all focus-within:shadow-[0_0_25px_rgba(168,85,247,0.4)] group">
              <div className="flex items-center bg-[#090b14]/90 backdrop-blur-2xl rounded-full px-6 py-3.5 w-full h-full">
                <Search className="text-gray-400 group-focus-within:text-indigo-400 transition-colors mr-3" size={24} />
                <input 
                  value={query}
                  onChange={handleSearch}
                  placeholder="Search..." 
                  className="bg-transparent text-lg w-full outline-none text-white placeholder-gray-500 font-medium"
                />
                {loading && <div className="w-5 h-5 border-2 border-t-fuchsia-500 rounded-full animate-spin"></div>}
              </div>
            </div>

            {/* Float Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-[110%] left-0 w-full bg-black/50 backdrop-blur-2xl border border-white/10 ring-1 ring-inset ring-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-50 mt-2">
                {searchResults.map((s) => (
                  <div key={s.id} className="flex gap-4 p-4 items-center hover:bg-white/5 border-b border-white/5 last:border-0 transition group">
                    <img 
                      src={s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "https://via.placeholder.com/92x138?text=Brak"}
                      alt={s.name}
                      className="w-12 h-16 rounded-md object-cover ring-1 ring-white/10 shadow-lg"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-white text-lg flex items-center gap-2">
                         {s.name}
                         {s.watch_provider_logo && <img src={`https://image.tmdb.org/t/p/w45${s.watch_provider_logo}`} className="w-5 h-5 rounded shadow-sm" title={s.watch_provider_name} alt="VOD"/>}
                      </h4>
                      <p className="text-sm text-gray-400">{s.first_air_date?.substring(0, 4) || "Puste"}</p>
                    </div>
                    <div className="flex items-center justify-end">
                       <button 
                         onClick={() => addSeries(s, defaultBoard === "private" ? null : defaultBoard)}
                         className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 hover:ring-indigo-500/50 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:bg-[#a855f7]/20 group-hover:text-white group-hover:ring-[#a855f7]/50"
                         title={defaultBoard === "private" ? "Dodaj do Osobistej Tablicy" : "Dodaj do Grupy"}
                       >
                         <Plus size={20} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Owalne Tabsy Prawa Strona - Split Layout */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full md:w-auto">
             
             {/* Pasek Zakłądek */}
             <div className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg w-full md:w-auto">
               <div className="flex w-full md:w-auto overflow-x-auto bg-[#060813]/90 backdrop-blur-2xl rounded-full p-2 items-center gap-1 h-full scrollbar-hide snap-x relative z-10">
                 <button 
                    onClick={(e) => toggleDefaultBoard(e, "private")}
                    className={`shrink-0 snap-start py-2 px-5 md:px-6 rounded-full text-sm font-bold transition whitespace-nowrap ${defaultBoard === 'private' ? 'bg-[#a855f7]/20 ring-1 ring-[#a855f7]/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
                 >
                    Osobista Tablica
                 </button>
                 
                 {workspaces.map(w => (
                    <button 
                      key={w.id}
                      onClick={(e) => toggleDefaultBoard(e, w.id)}
                      className={`shrink-0 snap-start py-2 px-5 md:px-6 rounded-full text-sm font-bold transition whitespace-nowrap ${defaultBoard === w.id ? 'bg-[#a855f7]/20 ring-1 ring-[#a855f7]/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'text-gray-400 border border-transparent hover:text-white hover:bg-white/5'}`}
                    >
                       {w.workspace_name}
                    </button>
                 ))}
               </div>
             </div>

             {/* Pasek Akcji */}
             <div className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg shrink-0">
                <div className="flex bg-[#060813]/90 backdrop-blur-2xl rounded-full p-1.5 items-center justify-center gap-2 w-full h-full">
                  <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition" title="Stwórz Pokój">
                     <Plus size={16} />
                  </button>

                  {defaultBoard !== "private" && (
                     <>
                       <button onClick={openInviteModal} className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-[#a855f7]/20 border-border-[#a855f7]/50 hover:bg-[#a855f7]/40 flex items-center justify-center text-white transition ring-1 ring-[#a855f7]/50" title="Zaproś do Pokoju">
                          <UserPlus size={16} />
                       </button>
                       <button onClick={() => setWorkspaceToDelete(defaultBoard)} className="w-10 h-10 md:w-9 md:h-9 rounded-full bg-white/5 hover:bg-red-500/20 ring-1 ring-white/5 hover:ring-red-500/40 flex items-center justify-center text-gray-400 hover:text-white transition" title="Zniszcz Pokój">
                          <Trash2 size={16} />
                       </button>
                     </>
                  )}
                </div>
             </div>

          </div>

        </section>

        {/* Modal Potwierdzenia Kosza (UI zastepujace JS confirm) */}
        {workspaceToDelete !== null && (
           <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-red-500/20 shadow-[0_0_80px_rgba(239,68,68,0.15)] animate-fade-in relative flex flex-col">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-red-500/20 rounded-full shrink-0">
                       <Trash2 className="text-red-500" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-red-500">Spalenie Ekipy</h3>
                 </div>
                 <p className="text-sm text-gray-400 mb-6 mt-2 font-medium">Czy na pewno chcesz usunąć tę listę kinową oraz bezpowrotnie pozbawić do niej dostępu całą ekipę? Tej akcji nie da się cofnąć!</p>
                 
                 <div className="flex gap-4">
                     <button onClick={() => setWorkspaceToDelete(null)} className="flex-1 py-3 rounded-xl hover:bg-white/10 transition text-gray-400 font-bold border border-transparent hover:border-white/10">Anuluj</button>
                     <button 
                        onClick={confirmDeleteWorkspace}
                        className="flex-1 bg-red-600/80 hover:bg-red-500 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition text-white border border-red-500/50"
                     >Spal pokój</button>
                 </div>
              </div>
           </div>
        )}

        {/* Modal Customowy - Tworzenie Wspoldzelonego Pokoju Ostrza */}
        {isModalOpen && (
             <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in relative">
                  <h3 className="text-2xl font-bold mb-2">Nowy Pokój</h3>
                  <p className="text-sm text-gray-400 mb-6">Wpisz nazwę paczki ze znajomymi (np. Nocna Ekipa Binge).</p>
                  
                  <input 
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Wpisz nazwę pokoju..."
                    autoFocus
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 mb-6 outline-none focus:border-purple-500 transition text-white"
                  />
                  
                  <div className="flex gap-4">
                     <button onClick={() => { setIsModalOpen(false); setNewWorkspaceName(""); }} className="flex-1 py-3 rounded-xl hover:bg-white/10 transition text-gray-400 font-bold border border-transparent hover:border-white/10">Anuluj</button>
                     <button 
                        onClick={async () => {
                           if(!newWorkspaceName.trim()) return;
                           await fetch("/api/workspace", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ action: "CREATE", name: newWorkspaceName }) });
                           setIsModalOpen(false);
                           setNewWorkspaceName("");
                           fetchWorkspaces();
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold shadow-lg transition"
                     >Stwórz</button>
                  </div>
                </div>
             </div>
          )}

        {/* Modal Zapraszania do Pokoju z Puli użytkowników */}
        {isInviteModalOpen && (
           <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in relative flex flex-col max-h-[85vh]">
                <h3 className="text-2xl font-bold mb-2">Zaproś do grupy</h3>
                <p className="text-sm text-gray-400 mb-6">Wybierz użytkownika z serwera, aby zaprosić go The do pokoju.</p>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 scrollbar-thin scrollbar-thumb-purple-600">
                   {availableUsers.length === 0 ? (
                      <div className="text-gray-500 text-center py-6 text-sm">Brak wolnych znajomych do wkręcenia!</div>
                   ) : availableUsers.map(u => (
                      <div key={u.id} className="flex justify-between items-center bg-[#090b14] p-3 rounded-2xl border border-white/5 hover:border-[#a855f7]/50 transition opacity-80 hover:opacity-100">
                         <div className="flex items-center gap-3">
                           <img src={u.image || "https://ui-avatars.com/api/?background=random&name=" + u.name} alt={u.name} className="w-10 h-10 rounded-full object-cover shadow-md" />
                           <div>
                             <h4 className="text-white font-bold text-sm leading-none mb-1">{u.name}</h4>
                             <p className="text-xs text-gray-500 truncate max-w-[150px]">{u.email}</p>
                           </div>
                         </div>
                         <button onClick={() => inviteUserById(u.id)} className="bg-white/10 hover:bg-[#a855f7] text-white p-2 px-4 rounded-xl text-xs font-bold transition shadow-sm border border-transparent">Zaproś</button>
                      </div>
                   ))}
                </div>
                
                <div className="flex mt-auto">
                   <button onClick={() => setIsInviteModalOpen(false)} className="w-full py-4 rounded-xl hover:bg-white/10 transition text-gray-400 font-bold border border-transparent hover:border-white/10">Zamknij</button>
                </div>
              </div>
           </div>
        )}

        {/* Kokpit Tablicy: Posortowane Kafelki Finałowe */}
        <section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(defaultBoard === "private" ? mySeries : activeBoardData?.series || []).length === 0 ? (
               <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2 px-8">
               <h3 className="text-gray-400 text-xl font-medium mb-3">Ta tablica jest pusta.</h3>
               <p className="text-sm text-gray-500 max-w-sm mx-auto">Skorzystaj z wyszukiwarki lub dodaj coś do tej kolekcji by zacząć śledzić finały.</p>
             </div>
            ) : (
              (defaultBoard === "private" ? mySeries : activeBoardData?.series || []).map((item: any) => {
                const epDate = item.seriesCache?.next_ep_air_date;
                const posterPath = item.seriesCache?.poster_path;
                const title = item.seriesCache?.title;
                const tmdbId = item.tmdb_id;
                
                let daysLeft: number | null = null;
                if (epDate) {
                  const premiereDate = new Date(epDate);
                  premiereDate.setHours(0, 0, 0, 0);
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  daysLeft = Math.round((premiereDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                }
                
                return (
                <Link href={`/series/${tmdbId}${defaultBoard !== 'private' ? '?ws=' + defaultBoard : ''}`} key={item.id} className="rounded-2xl overflow-hidden group relative block cursor-pointer transition-transform duration-300 hover:scale-[1.02] aspect-[2/3] bg-black shadow-2xl border border-white/5">
                   
                   {/* Labelka */}
                   {daysLeft !== null && daysLeft > 0 && (
                     <div className="absolute top-4 right-4 z-10 bg-[#e11d48] text-white text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                       {daysLeft === 1 ? 'Za 1 dzień' : `Za ${daysLeft} dni`}
                     </div>
                   )}
                   {daysLeft !== null && daysLeft <= 0 && (
                     <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[11px] uppercase tracking-wider font-extrabold px-4 py-1 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-white/20">
                       Dostępny
                     </div>
                   )}

                   {/* Poster (Tło całego kafelka) */}
                   <img 
                     src={posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : "https://via.placeholder.com/500x750?text=Brak+Okładki"} 
                     className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-700"
                     alt={title}
                   />
                   
                   {/* Nakładka dolna (Gradientowe półprzezroczyste tło) */}
                   <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#05070e] via-[#05070e]/95 to-transparent pt-28 opacity-100 transition">
                      <h3 className="font-normal uppercase tracking-[0.15em] text-lg mb-1.5 truncate text-[#f8fafc] drop-shadow-md group-hover:text-[#a855f7] transition" title={title}>{title}</h3>
                      
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 drop-shadow-md">
                        <Calendar size={13} className="text-gray-500"/>
                        {epDate 
                          ? new Date(epDate).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' }) 
                          : "Brak potwierdzonej daty"}
                      </div>
                      
                      <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-20 mt-0 group-hover:mt-4">
                         <span className="text-[10px] font-bold text-[#a855f7] uppercase tracking-widest flex items-center gap-1">Szczegóły <ChevronDown size={12} className="-rotate-90"/></span>
                      </div>
                   </div>

                </Link>
                );
              })
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

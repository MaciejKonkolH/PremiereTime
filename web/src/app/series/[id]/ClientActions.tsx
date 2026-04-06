"use client";

import { CheckSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientActions({ tmdb_id, workspaceId, workspaceName }: { tmdb_id: number, workspaceId: string | null, workspaceName?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const handleArchive = async () => {
    setLoading(true);
    if (workspaceId) {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARCHIVE_SERIES", workspaceId, tmdb_id })
      });
      router.push("/");
    } else {
      await fetch("/api/series", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdb_id, restore: false })
      });
      router.push("/");
    }
  };

  const confirmRemove = async () => {
    setIsDeleteModalOpen(false);
    setLoadingRemove(true);
    if (workspaceId) {
      await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REMOVE_SERIES", workspaceId, tmdb_id })
      });
      router.push("/");
    } else {
      await fetch(`/api/series?tmdb_id=${tmdb_id}`, { method: "DELETE" });
      router.push("/");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <button 
        onClick={handleArchive}
        disabled={loading || loadingRemove}
        className="w-full bg-red-600/20 hover:bg-red-600 border border-red-500/50 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 text-red-100 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_35px_rgba(220,38,38,0.5)] disabled:opacity-50"
      >
        <CheckSquare size={22} className={loading ? "animate-spin" : ""} /> 
        {loading ? "Przenoszenie..." : "Obejrzane (Archiwizuj)"}
      </button>

      <button 
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={loading || loadingRemove}
        className="w-full bg-transparent hover:bg-white/5 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-red-400 transition-all duration-300 disabled:opacity-50"
      >
        <Trash2 size={16} className={loadingRemove ? "animate-pulse" : ""} /> 
        {loadingRemove ? "Usuwanie..." : "Usuń z listy"}
      </button>

      <p className="text-center text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-widest text-[#a855f7]">
        {workspaceId ? `Ekipa: ${workspaceName}` : "Pracujesz na swoim prywatnym koncie"}
      </p>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#060813]/85 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-[#050710] border border-red-500/20 p-8 rounded-3xl z-10 max-w-md w-full shadow-[0_0_60px_rgba(220,38,38,0.3)] relative">
            <h3 className="text-2xl font-extrabold text-white mb-3 flex items-center gap-2"><Trash2 size={24} className="text-red-500"/> Całkowite Usunięcie</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Zaraz nieodwracalnie wymażesz z tablicy postępy śledzenia tego serialu! By przywrócić wgląd, trzeba będzie wrzucić go ponownie z menu Startowego. Jesteś pewny misji?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-white font-medium transition"
              >
                Anuluj
              </button>
              <button 
                onClick={confirmRemove}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-lg shadow-red-500/20"
              >
                Eksmituj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

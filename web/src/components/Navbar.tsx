"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, MonitorPlay, Archive, LogOut } from "lucide-react";
import Link from "next/link";
import { UserButton, SignInButton, useUser, useClerk } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
       document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const fetchNotifs = async () => {
     try {
        const res = await fetch("/api/notifications");
        if(res.ok) {
           const data = await res.json();
           setNotifications(data);
           setUnreadCount(data.filter((n: any) => !n.is_read).length);
        }
     } catch(e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const markAsRead = async () => {
     setIsDropdownOpen(!isDropdownOpen);
     if(!isDropdownOpen && unreadCount > 0) {
        await fetch("/api/notifications", { method: "PATCH" });
        setUnreadCount(0);
        setNotifications((prev: any[]) => prev.map((n: any) => ({...n, is_read: true})));
     }
  };

  const visibleNotifs = [
    ...notifications.filter((n: any) => !n.is_read),
    ...notifications.filter((n: any) => n.is_read).slice(0, 3)
  ];

  return (
    <div className={`fixed z-[100] transition-all duration-500 ease-in-out ${
      isScrolled 
        ? "top-4 left-1/2 w-max -translate-x-1/2 p-[1.5px] rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 shadow-[0_0_40px_rgba(0,0,0,0.8)]" 
        : "top-0 left-0 w-full bg-transparent border-b border-white/5 p-0"
    }`}>
      <nav className={`transition-all duration-500 ease-in-out flex items-center h-full w-full ${
        isScrolled
          ? "bg-[#060813]/95 backdrop-blur-3xl rounded-full px-4 md:px-8 py-2 md:py-3 shadow-inner"
          : "px-4 md:px-8 py-3 md:py-4 flex-wrap justify-between gap-y-3"
      }`}>
      <Link href="/?noredirect=1" className={`flex items-center justify-center group transition-all duration-500 ${
        isScrolled ? "mr-2 md:mr-6" : "w-full sm:w-auto gap-2 md:gap-3"
      }`}>
        <div className="p-1.5 md:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition shrink-0">
          <MonitorPlay size={20} className="text-white" />
        </div>
        <span className={`font-extrabold text-lg md:text-xl tracking-wide text-white group-hover:text-indigo-400 transition-[max-width,opacity] duration-300 ease-in whitespace-nowrap overflow-hidden ${
          isScrolled ? "max-w-0 opacity-0" : "max-w-[250px] opacity-100"
        }`} style={{fontFamily: "'Outfit', 'Montserrat', sans-serif"}}>Premiere<span className="font-normal text-gray-300">Time</span></span>
      </Link>

      <div className={`flex items-center justify-center transition-all duration-500 ${
         isScrolled ? "gap-2 md:gap-4 w-full" : "gap-4 md:gap-6 w-full sm:w-auto"
      }`}>
        <Link href="/archive" className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-indigo-400 transition px-2" title="Zarządzaj Archiwum">
           <Archive size={20} />
           <span className="hidden sm:inline">Archiwum</span>
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button onClick={markAsRead} className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition anim-ring">
            <Bell size={20} className={unreadCount > 0 ? "text-blue-400" : "text-gray-300"} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex min-w-4 h-4 p-1 px-1.5 min-w-[16px] text-[10px] items-center justify-center font-bold bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          
          {isDropdownOpen && (
             <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 top-14 w-[90vw] max-w-[360px] bg-[#060813]/98 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col gap-3 z-[200]">
               <h3 className="font-bold border-b border-white/10 pb-2">Powiadomienia Ekip</h3>
               {visibleNotifs.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Ostro, nikt ci niczego nie zaspoilerował.</p>
               ) : (
                  visibleNotifs.map((n: any) => (
                    <div key={n.id} className={`text-sm p-3 rounded-lg border transition ${!n.is_read ? 'bg-indigo-500/15 border-indigo-500/40 shadow-inner' : 'bg-white/5 border-white/5 opacity-70'}`}>
                      <p className="text-gray-300">{n.message}</p>
                    </div>
                  ))
               )}
             </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0">
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton />
              <button 
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition border border-white/5"
                title="Wyloguj"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            isLoaded && (
              <SignInButton mode="modal">
                <button className="text-sm font-bold text-gray-400 hover:text-white transition uppercase tracking-widest px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                  Zaloguj
                </button>
              </SignInButton>
            )
          )}
        </div>
      </div>
      </nav>
    </div>
  );
}

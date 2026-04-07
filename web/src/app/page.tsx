"use client";

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Globe, 
  Calendar, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  ChevronRight, 
  Star, 
  Menu, 
  X,
  CheckCircle2,
  Anchor,
  Zap,
  PenTool,
  Search,
  Plus,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk } from "@clerk/nextjs";

const AeternaTattooStudio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [mySeries, setMySeries] = useState<any[]>([]);
  const [activeBoardData, setActiveBoardData] = useState<any>(null);
  const [defaultBoard, setDefaultBoard] = useState("private");
  const [isBoardSelectOpen, setIsBoardSelectOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { signOut } = useClerk();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchWorkspaces = async () => {
    const res = await fetch("/api/workspace");
    if (res.ok) {
      setWorkspaces(await res.json());
    }
  };

  const fetchMySeries = async () => {
    const res = await fetch("/api/series");
    if (res.ok) {
      const data = await res.json();
      const sorted = (data.length ? data : []).sort((a: any, b: any) => {
        const dateA = a.seriesCache?.next_ep_air_date ? new Date(a.seriesCache.next_ep_air_date).getTime() : Infinity;
        const dateB = b.seriesCache?.next_ep_air_date ? new Date(b.seriesCache.next_ep_air_date).getTime() : Infinity;
        return dateA - dateB;
      });
      setMySeries(sorted);
    }
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
        localStorage.setItem("defaultBoard", "private");
        setDefaultBoard("private");
        fetchMySeries();
        setActiveBoardData(null);
      }
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    const stored = typeof window !== 'undefined' ? localStorage.getItem("defaultBoard") || "private" : "private";
    setDefaultBoard(stored);
    loadGridData(stored);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) return setSearchResults([]);
    
    const res = await fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`);
    if (res.ok) {
      setSearchResults(await res.json());
    }
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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const services = [
    {
      title: "Tatuaż Minimalistyczny",
      desc: "Delikatne, precyzyjne linie, które pięknie się starzeją. Idealne na pierwszy tatuaż.",
      icon: <PenTool className="w-8 h-8 text-amber-500" />,
    },
    {
      title: "Realizm",
      desc: "Fotorealistyczne portrety i detale przeniesione na skórę z mistrzowską precyzją.",
      icon: <Star className="w-8 h-8 text-amber-500" />,
    },
    {
      title: "Tradycyjny i Neo-Trad",
      desc: "Mocne kontury i żywe kolory, które przetrwają próbę czasu. Hołd dla klasyki.",
      icon: <Anchor className="w-8 h-8 text-amber-500" />,
    },
    {
      title: "Cover-up i Poprawki",
      desc: "Przekształcamy stare wzory w nowe arcydzieła, z których znów będziesz dumny.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-100 font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Nawigacja */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="text-amber-500 uppercase tracking-[0.2em]">Aeterna</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 uppercase text-xs tracking-widest font-semibold">
            <a href="#about" className="hover:text-amber-500 transition-colors">O nas</a>
            <a href="#portfolio" className="hover:text-amber-500 transition-colors">Portfolio</a>
            <button 
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="text-white hover:text-amber-500 transition-colors"
              title="Wyloguj"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <a href="#contact" className="px-5 py-2 bg-amber-600 text-black hover:bg-amber-500 transition-all rounded-sm font-bold">Zarezerwuj termin</a>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center space-y-8"
          >
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-2xl uppercase tracking-widest">O nas</a>
            <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="text-2xl uppercase tracking-widest">Portfolio</a>
            <button 
              onClick={() => { signOut({ redirectUrl: '/sign-in' }); setIsMenuOpen(false); }}
              className="text-2xl uppercase tracking-widest text-amber-500"
            >
              Wyloguj
            </button>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="px-8 py-3 bg-amber-600 text-black rounded-sm font-bold uppercase tracking-widest">Zarezerwuj</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80" 
            alt="Proces tatuowania" 
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-serif mb-6 italic">Sztuka na wieczność.</h1>
            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light italic text-balance">
              Zmień swoją skórę w płótno dla mistrzowskiego rzemiosła. Studio Aeterna to miejsce, gdzie pasja spotyka się z trwałością.
            </p>
            
            {/* Search Input */}
            <div className="relative max-w-xl mx-auto mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={handleSearch}
                  className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-white placeholder:text-stone-600 backdrop-blur-sm"
                  placeholder="Szukaj serialu do dodania..."
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[400px] overflow-y-auto"
                    >
                      {searchResults.map((item: any) => (
                        <div 
                          key={item.id}
                          onClick={() => addToBoard(item)}
                          className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                        >
                          <img 
                            src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://via.placeholder.com/92x138?text=N/A"} 
                            className="w-12 h-18 object-cover rounded shadow-sm"
                            alt=""
                          />
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-sm text-white">{item.name || item.original_name}</h4>
                            <p className="text-xs text-stone-500">{item.first_air_date?.split('-')[0]}</p>
                          </div>
                          <Plus className="w-5 h-5 text-amber-500" />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="#portfolio" className="px-8 py-4 bg-amber-600 text-black font-bold uppercase tracking-widest hover:bg-white transition-all w-full md:w-auto text-center">
                Zobacz Portfolio
              </a>
              <a href="#contact" className="px-8 py-4 border border-white/20 hover:bg-white/10 transition-all w-full md:w-auto uppercase tracking-widest font-bold text-center border-b-2 border-b-amber-600/30">
                Konsultacja
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* O nas */}
      <section id="about" className="py-24 bg-[#0d0d0d]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-amber-500 font-bold tracking-widest uppercase mb-4 block text-sm">O nas</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Tworzymy historię na skórze od 2012 roku</h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                Zlokalizowane w sercu Trójmiasta, Studio Aeterna to sterylna przestrzeń klasy premium dla wymagających. Wierzymy, że tatuaż to nie tylko atrament – to manifestacja Twojej osobowości, historia zapisana w cieniu i świetle.
              </p>
              <ul className="space-y-4 text-stone-200">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-amber-500 w-5 h-5" />
                  <span>Certyfikowani artyści i najwyższa higiena</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-amber-500 w-5 h-5" />
                  <span>Dostępne wegańskie tusze najwyższej jakości</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-amber-500 w-5 h-5" />
                  <span>Indywidualne projekty na zamówienie</span>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              {...fadeInUp}
              className="grid grid-cols-2 gap-4"
            >
              <img src="https://images.unsplash.com/photo-1550523171-700947ba964e?auto=format&fit=crop&q=80" alt="Wnętrze studia" className="rounded-lg shadow-2xl mt-8" />
              <img src="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&q=80" alt="Praca artysty" className="rounded-lg shadow-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24 px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4 uppercase tracking-tighter">Najnowsze Prace</h2>
          <div className="h-1 w-24 bg-amber-600 mx-auto"></div>
        </div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 0.98 }}
              className="relative overflow-hidden group aspect-square rounded-lg cursor-pointer bg-neutral-900 shadow-xl"
            >
              <img 
                src={`https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&q=80&sig=${i}`} 
                alt={`Praca ${i}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-2 border-amber-600/30 m-4 rounded-md">
                <span className="text-white font-semibold uppercase tracking-widest flex items-center gap-2">
                  Zobacz detale <ChevronRight className="w-4 h-4"/>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Usługi */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {services.map((s, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="p-8 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/50 transition-all border-b-4 border-b-amber-600/20"
            >
              <div className="mb-6">{s.icon}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Kontakt i Rezerwacja */}
      <section id="contact" className="py-24 bg-stone-900/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl font-serif mb-8">Napisz do nas</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase text-xs mb-1 text-amber-500">Nasza Lokalizacja</h4>
                    <p className="text-stone-300">ul. Portowa 12, Gdynia, Polska</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase text-xs mb-1 text-amber-500">Godziny Otwarcia</h4>
                    <p className="text-stone-300">Wt. - Sob.: 11:00 - 19:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase text-xs mb-1 text-amber-500">Zapytania</h4>
                    <p className="text-stone-300">hello@aeternatattoo.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold uppercase text-xs mb-1 text-amber-500">Telefon</h4>
                    <p className="text-stone-300">+48 555 123 456</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex space-x-6">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-amber-600 hover:text-black transition-all border border-white/10">
                  <Share2 className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-amber-600 hover:text-black transition-all border border-white/10">
                  <Globe className="w-6 h-6" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              {...fadeInUp}
              className="bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-6 text-center italic text-balance">Zaproś sztukę na swoją skórę</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Imię" className="w-full bg-black/50 border border-white/10 p-3 rounded-md focus:border-amber-500 outline-none transition-colors text-white" />
                  <input type="text" placeholder="Nazwisko" className="w-full bg-black/50 border border-white/10 p-3 rounded-md focus:border-amber-500 outline-none transition-colors text-white" />
                </div>
                <input type="email" placeholder="E-mail" className="w-full bg-black/50 border border-white/10 p-3 rounded-md focus:border-amber-500 outline-none transition-colors text-white" />
                <select className="w-full bg-black/50 border border-white/10 p-3 rounded-md focus:border-amber-500 outline-none transition-colors text-stone-400">
                  <option>Wybierz styl</option>
                  <option>Minimalizm</option>
                  <option>Realizm</option>
                  <option>Tradycyjny</option>
                  <option>Inny</option>
                </select>
                <textarea rows={4} placeholder="Opisz swój pomysł (rozmiar, miejsce...)" className="w-full bg-black/50 border border-white/10 p-4 rounded-md focus:border-amber-500 outline-none transition-colors text-white"></textarea>
                <button type="submit" className="w-full py-4 bg-amber-600 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm shadow-lg shadow-amber-600/20">
                  Wyślij prośbę o termin
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stopka */}
      <footer className="py-12 border-t border-white/5 text-center bg-black">
        <p className="text-stone-500 text-xs tracking-widest uppercase mb-2">
          &copy; {new Date().getFullYear()} AETERNA TATTOO STUDIO. Wszystkie prawa zastrzeżone.
        </p>
        <p className="text-stone-600 text-[10px]">Stworzone z pasją do sztuki trwałej.</p>
      </footer>
    </div>
  );
};

export default AeternaTattooStudio;

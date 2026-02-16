"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Suggestion {
  id: number;
  title: string;
  brand: string | null;
  category: string;
  images: { url: string }[];
}

export function HeaderSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const closeSearch = useCallback(() => {
    setIsExpanded(false);
    setQuery("");
    setSuggestions([]);
    setSelectedIndex(-1);
  }, []);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, closeSearch]);

  // Handle escape key and Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeSearch();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Suggestion fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        router.push(`/listing/${suggestions[selectedIndex].id}`);
        closeSearch();
      } else if (query.trim()) {
        router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
        closeSearch();
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-end">
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative flex items-center"
            >
              <div className="absolute left-3 text-slate-400">
                {isLoading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search sneakers..."
                className="h-10 w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-400 shadow-sm"
              />
              <button
                onClick={closeSearch}
                className="absolute right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isExpanded && (query.length >= 2 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl z-50"
          >
            <div className="p-2">
              {suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(`/listing/${item.id}`);
                        closeSearch();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                        selectedIndex === index ? "bg-red-50 text-red-900" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 ${selectedIndex === index ? "bg-white" : "bg-slate-50"}`}>
                        {item.images && item.images[0] ? (
                          <img 
                            src={item.images[0].url} 
                            alt={item.title}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                        <span className={`truncate text-xs ${selectedIndex === index ? "text-red-500" : "text-slate-400"}`}>
                          {item.brand ? `${item.brand} • ` : ""}{item.category}
                        </span>
                      </div>
                    </button>
                  ))}
                  
                  <div className="mt-2 border-t border-slate-100 pt-2 px-2">
                    <Link
                      href={`/browse?q=${encodeURIComponent(query)}`}
                      onClick={closeSearch}
                      className="flex w-full items-center justify-center rounded-lg py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      See all results for "{query}"
                    </Link>
                  </div>
                </div>
              ) : query.length >= 2 && !isLoading ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">No results found for "{query}"</p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="h-6 w-6 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

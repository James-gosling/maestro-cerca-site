/*
 * DESIGN: Artesanía Digital — warm search experience with Zero Input State.
 * Implements audit P2: on focus, shows trending repairs; on typing, debounced
 * autocomplete matches worker names, trades, and skills.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Flame, X } from "lucide-react";
import { TRENDING_REPAIRS } from "@/data/mockMaestros";
import type { Maestro } from "@/data/mockMaestros";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSelectSuggestion: (value: string) => void;
  /** Array of maestros to search against (from API or mock). */
  maestros: Maestro[];
}

interface Suggestion {
  type: "trending" | "worker" | "trade" | "skill";
  label: string;
  sublabel?: string;
}

export default function SearchBar({ query, setQuery, onSelectSuggestion, maestros }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Generate suggestions on debounced query using the passed-in maestros
  useEffect(() => {
    if (!debouncedQuery) return;
    const results: Suggestion[] = [];
    const q = debouncedQuery;

    // Match workers by name
    maestros.filter((m: Maestro) => m.name.toLowerCase().includes(q)).forEach((m) => {
      results.push({ type: "worker", label: m.name, sublabel: `${m.trade} · ${m.location}` });
    });

    // Match trades
    const matchedTrades = new Set<string>();
    maestros.forEach((m: Maestro) => {
      if (m.trade.toLowerCase().includes(q) && !matchedTrades.has(m.trade)) {
        matchedTrades.add(m.trade);
        results.push({ type: "trade", label: m.trade });
      }
      if (m.tradeCategory.toLowerCase().includes(q) && !matchedTrades.has(m.tradeCategory)) {
        matchedTrades.add(m.tradeCategory);
        results.push({ type: "trade", label: m.tradeCategory });
      }
    });

    // Match skills
    const matchedSkills = new Set<string>();
    maestros.forEach((m: Maestro) => {
      m.skills.forEach((s) => {
        if (s.toLowerCase().includes(q) && !matchedSkills.has(s)) {
          matchedSkills.add(s);
          results.push({ type: "skill", label: s, sublabel: m.trade });
        }
      });
    });

    setSuggestions(results.slice(0, 6));
  }, [debouncedQuery, maestros]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setQuery(value);
      setSuggestions([]);
      setIsFocused(false);
      onSelectSuggestion(value);
    },
    [setQuery, onSelectSuggestion]
  );

  const showDropdown = isFocused && (suggestions.length > 0 || debouncedQuery === "");

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search size={20} className="absolute left-4 text-muted-foreground/60" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Ej. Plomero en Zibatá, Electricista en Juriquilla..."
          className="w-full pl-12 pr-10 py-4 text-base bg-card border-2 border-border rounded-2xl focus:border-navy focus:ring-4 focus:ring-navy/10 outline-none transition-all placeholder:text-mu[...]
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown: Zero Input State + Autocomplete */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Trending Repairs — Zero Input State */}
          {suggestions.length === 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                <Flame size={13} className="text-navy" />
                Reparaciones frecuentes
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_REPAIRS.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleSelect(r)}
                    className="text-sm bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-lg border border-border transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete Results */}
          {suggestions.length > 0 && (
            <div className="py-1">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.type}-${s.label}-${i}`}
                  onClick={() => handleSelect(s.label)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-center gap-3"
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      s.type === "worker"
                        ? "bg-navy/10 text-navy"
                        : s.type === "trade"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/10 text-emerald-brand"
                    }`}
                  >
                    {s.type === "worker" ? "Maestro" : s.type === "trade" ? "Oficio" : "Habilidad"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    {s.sublabel && (
                      <p className="text-xs text-muted-foreground">{s.sublabel}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

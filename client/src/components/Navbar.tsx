/*
 * DESIGN: Artesanía Digital — warm, transparent-to-opaque nav.
 * Stronger brand mark: MC seal with border ring, serif wordmark.
 * Active state: terracotta underline + color shift.
 */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onRegisterClick: () => void;
}

const NAV_ITEMS = [
  { id: "catalogo", label: "Catálogo" },
  { id: "nosotros", label: "Sobre Nosotros" },
  { id: "precios", label: "Precios y Planes" },
];

export default function Navbar({ activeSection, onNavigate, onRegisterClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand: Seal + Serif Wordmark */}
        <button
          onClick={() => handleNav("catalogo")}
          className="flex items-center gap-2.5"
        >
          <div className="relative w-9 h-9 rounded-full bg-terracotta flex items-center justify-center shadow-sm">
            <div className="absolute inset-0.5 rounded-full border border-white/20" />
            <span className="text-white font-bold text-sm font-sans relative z-10">MC</span>
          </div>
          <span className="text-lg font-bold text-foreground font-serif hidden sm:inline tracking-tight">
            Maestro Cerca
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "text-terracotta"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-terracotta rounded-full" />
              )}
            </button>
          ))}
          <button
            onClick={onRegisterClick}
            className="ml-3 bg-terracotta text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-terracotta-dark transition-colors active:scale-[0.97] shadow-sm"
          >
            Registra tu Oficio
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
          aria-label="Menú"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-in slide-in-from-top duration-150">
          <div className="container px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-terracotta/10 text-terracotta"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onRegisterClick();
                setMobileOpen(false);
              }}
              className="w-full bg-terracotta text-white text-sm font-semibold py-3 rounded-xl hover:bg-terracotta-dark transition-colors mt-2 shadow-sm"
            >
              Registra tu Oficio
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

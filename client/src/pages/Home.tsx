/*
 * DESIGN: Artesanía Digital — asymmetric Mexican Modernist layout.
 * Hero: left-aligned text block over right-weighted image, search as focal object.
 * Cards: varied heights with staggered masonry feel.
 * Signature motifs: terracotta gradient borders, seal-like verification marks.
 */

import { useState, useMemo, useCallback } from "react";
import { ShieldCheck, Star, Clock, Award, ArrowDown, Wrench, Zap, Building2, Paintbrush } from "lucide-react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import WorkerCard from "@/components/WorkerCard";
import WorkerDetailModal from "@/components/WorkerDetailModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import PricingComparison from "@/components/PricingComparison";
import EmptyState from "@/components/EmptyState";
import { MAESTROS, type Maestro, type Trade } from "@/data/mockMaestros";
import { toast } from "sonner";

const TRADE_ICONS: Record<string, React.ReactNode> = {
  Plomeros: <Wrench size={20} />,
  Electricistas: <Zap size={20} />,
  Albañiles: <Building2 size={20} />,
  Herreros: <Wrench size={20} />,
  Yeseros: <Paintbrush size={20} />,
  Pisos: <Building2 size={20} />,
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("catalogo");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Trade>("Todos");
  const [selectedWorker, setSelectedWorker] = useState<Maestro | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const filteredMaestros = useMemo(() => {
    let results = MAESTROS;
    if (activeFilter !== "Todos") {
      results = results.filter((m) => m.tradeCategory === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.trade.toLowerCase().includes(q) ||
          m.tradeCategory.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return results;
  }, [query, activeFilter]);

  const navigateToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSelectSuggestion = useCallback((value: string) => {
    const tradeMatch = MAESTROS.find((m) => m.tradeCategory.toLowerCase() === value.toLowerCase());
    if (tradeMatch) setActiveFilter(tradeMatch.tradeCategory as Trade);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeSection={activeSection}
        onNavigate={navigateToSection}
        onRegisterClick={() => setOnboardingOpen(true)}
      />

      {/* ── Hero: Asymmetric Mexican Modernist Composition ── */}
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-bg_6e683039.jpg"
            alt=""
            className="w-full h-full object-cover object-left-top"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Terracotta accent block — right side color panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[35%] hidden lg:block">
          <div className="absolute inset-0 bg-terracotta/15 backdrop-blur-[2px]" />
        </div>

        <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
            {/* Left content block */}
            <div className="max-w-xl">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-terracotta/20 rounded-full px-4 py-2 mb-6 shadow-sm">
                <div className="w-5 h-5 bg-terracotta rounded-full flex items-center justify-center">
                  <ShieldCheck size={11} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {MAESTROS.filter((m) => m.isVerified).length} maestros verificados disponibles
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] mb-4">
                Encuentra al maestro perfecto
                <br />
                <span className="text-terracotta">para tu hogar</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
                Profesionales verificados, con reseñas reales y garantía de satisfacción.
                Plomeros, electricistas, albañiles y más cerca de ti.
              </p>

              {/* Search Bar */}
              <SearchBar
                query={query}
                setQuery={setQuery}
                onSelectSuggestion={handleSelectSuggestion}
              />

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => navigateToSection("catalogo")}
                  className="text-xs font-medium text-muted-foreground hover:text-terracotta transition-colors flex items-center gap-1.5"
                >
                  Ver catálogo
                  <ArrowDown size={14} className="animate-bounce" />
                </button>
              </div>
            </div>

            {/* Right stats block — asymmetric */}
            <div className="hidden lg:flex flex-col gap-3 w-[280px]">
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-terracotta font-serif">4.7</p>
                <p className="text-xs text-muted-foreground">Calificación promedio</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-terracotta font-serif">&lt; 30 min</p>
                <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
              </div>
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
                <p className="text-2xl font-bold text-terracotta font-serif">2,400+</p>
                <p className="text-xs text-muted-foreground">Trabajos completados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog Section ── */}
      <section id="catalogo" className="py-12 sm:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header with signature accent line */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-1 bg-terracotta rounded-full" />
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Maestros disponibles
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {filteredMaestros.length} profesional{filteredMaestros.length !== 1 ? "es" : ""} cerca de ti
              </p>
            </div>
          </div>

          <FilterPills
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            maestros={filteredMaestros}
            allMaestros={MAESTROS}
          />

          {/* Results Grid — varied card sizes for masonry feel */}
          <div className="mt-8">
            {filteredMaestros.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredMaestros.map((worker, i) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    index={i}
                    onViewProfile={() => setSelectedWorker(worker)}
                    onContact={() => setSelectedWorker(worker)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                query={query}
                filter={activeFilter}
                onClearQuery={() => setQuery("")}
                onClearFilter={() => setActiveFilter("Todos")}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Trust / About Section ── */}
      <section id="nosotros" className="relative py-16 sm:py-20">
        {/* Signature terracotta background panel */}
        <div className="absolute inset-0 bg-sand-dark/40" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta/40 to-transparent" />

        <div className="relative container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              ¿Por qué confiar en Maestro Cerca?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Cada maestro pasa por un proceso de verificación riguroso antes de aparecer en nuestra plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck size={22} />,
                title: "Verificación completa",
                desc: "Identidad, antecedentes y documentos verificados para cada profesional registrado.",
              },
              {
                icon: <Star size={22} />,
                title: "Reseñas reales",
                desc: "Calificaciones verificadas de clientes reales. Sin reseñas falsas ni infladas.",
              },
              {
                icon: <Clock size={22} />,
                title: "Garantía de 30 días",
                desc: "Si no quedas satisfecho con el servicio, te devolvemos tu dinero sin preguntas.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl p-6 border border-terracotta/10 warm-shadow group hover:border-terracotta/30 transition-colors"
              >
                <div className="w-11 h-11 bg-terracotta/10 rounded-xl flex items-center justify-center mb-4 text-terracotta group-hover:bg-terracotta/15 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats with signature separators */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-0">
            {[
              { value: `${MAESTROS.length}+`, label: "Maestros verificados" },
              { value: "2,400+", label: "Trabajos completados" },
              { value: "4.7", label: "Calificación promedio" },
              { value: "< 30min", label: "Tiempo de respuesta" },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center py-5 ${i < 3 ? "sm:border-r sm:border-border/50" : ""}`}>
                <p className="text-2xl sm:text-3xl font-bold text-terracotta font-serif">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="precios" className="py-16 sm:py-20">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-terracotta rounded-full" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Precios y Planes
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Elige el plan que mejor se adapte a tus necesidades. Sin cargos ocultos.
            </p>
          </div>

          <PricingComparison />

          <div className="mt-8 bg-emerald-brand/5 border border-emerald-brand/20 rounded-2xl p-5 flex items-start gap-3">
            <Award size={20} className="text-emerald-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Garantía de satisfacción</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Si el maestro no cumple con lo acordado, Maestro Cerca interviene y gestiona la devolución de tu pago dentro de los primeros 30 días.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Worker CTA Section ── */}
      <section className="py-16 sm:py-20">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div
            className="rounded-3xl overflow-hidden relative min-h-[280px] flex items-center"
            style={{ backgroundImage: "url(/manus-storage/workers-action_fe6834a9.jpg)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-terracotta/85 to-terracotta-dark/70" />
            <div className="relative p-8 sm:p-12 max-w-lg">
              {/* MC seal motif */}
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-5 border border-white/20">
                <span className="text-white font-bold text-base">MC</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                ¿Eres un profesional del oficio?
              </h2>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Regístrate gratis y recibe solicitudes de clientes cerca de ti.
                Obtén el Sello Maestro y destaca entre la competencia.
              </p>
              <button
                onClick={() => setOnboardingOpen(true)}
                className="bg-white text-terracotta font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors active:scale-[0.97] text-sm shadow-lg"
              >
                Registra tu Oficio — Es gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-border/50 bg-card/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">MC</span>
              </div>
              <span className="text-sm font-semibold text-foreground font-serif">Maestro Cerca</span>
              <span className="text-xs text-muted-foreground">© 2026</span>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => toast.info("Términos próximamente disponibles")} className="text-xs text-muted-foreground hover:text-terracotta transition-colors">
                Términos
              </button>
              <button onClick={() => toast.info("Privacidad próximamente disponible")} className="text-xs text-muted-foreground hover:text-terracotta transition-colors">
                Privacidad
              </button>
              <button onClick={() => toast.info("Contacto próximamente disponible")} className="text-xs text-muted-foreground hover:text-terracotta transition-colors">
                Contacto
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      <WorkerDetailModal
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
      />
      {onboardingOpen && (
        <OnboardingWizard onClose={() => setOnboardingOpen(false)} />
      )}
    </div>
  );
}

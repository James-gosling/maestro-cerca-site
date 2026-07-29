/*
 * DESIGN: Artesanía Digital — asymmetric Mexican Modernist layout.
 * Hero: left-aligned text block over right-weighted image, search as focal object.
 * Cards: varied heights with staggered masonry feel.
 * Signature motifs: terracotta gradient borders, seal-like verification marks.
 */

import { useState, useMemo, useCallback } from "react";
import { ShieldCheck, Star, Clock, Award, ArrowDown, Wrench, Zap, Building2, Paintbrush, MapPin } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterPills from "@/components/FilterPills";
import WorkerCard from "@/components/WorkerCard";
import WorkerDetailModal from "@/components/WorkerDetailModal";
import OnboardingWizard from "@/components/OnboardingWizard";
import PricingComparison from "@/components/PricingComparison";
import EmptyState from "@/components/EmptyState";
import RadiusFilter from "@/components/RadiusFilter";
import { MAESTROS, type Maestro, type Trade } from "@/data/mockMaestros";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * Convert an API maestro row (from maestros.list / searchByRadius) into
 * the mock Maestro shape that WorkerCard expects. Fields that the API
 * doesn't provide are filled with safe defaults so the UI never breaks.
 */
function apiRowToMock(apiRow: {
  id: number;
  name: string;
  trade: string;
  experience: number | null;
  workType: string | null;
  zone: string;
  phone: string;
  galleryImages?: { url: string; caption: string; key?: string }[];
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number;
  profileUrl?: string;
}): Maestro & { _apiId: number; _distance?: number } {
  const tradeCategory = `${apiRow.trade}s`.replace(/es$/, "es").replace(/os$/, "os");
  return {
    id: `api-${apiRow.id}`,
    name: apiRow.name,
    trade: apiRow.trade,
    tradeCategory,
    experienceYears: apiRow.experience ?? 0,
    rating: 4.5,
    reviewCount: 0,
    skills: [apiRow.trade],
    location: apiRow.zone,
    availability: "Disponible hoy",
    imageUrl: apiRow.galleryImages?.[0]?.url ?? "",
    isVerified: true,
    bio: `${apiRow.trade} con ${apiRow.experience ?? 0} años de experiencia en ${apiRow.zone}.`,
    galleryImages: (apiRow.galleryImages ?? []).map((g) => ({ url: g.url, caption: g.caption })),
    reviews: [],
    phonePartial: apiRow.phone.replace(/^(\+?52\s?)(\d{2})(\d{4})/, (_, p1, p2, rest) => `+${p1} ${p2} **** ${rest.slice(-4)}`),
    hourlyRate: "$400 – $700 MXN/hr",
    completedJobs: 0,
    responseTime: "< 1 hora",
    _apiId: apiRow.id,
    _distance: apiRow.distanceKm,
  };
}

const TRADE_ICONS: Record<string, React.ReactNode> = {
  Plomeros: <Wrench size={20} />,
  Electricistas: <Zap size={20} />,
  Albañiles: <Building2 size={20} />,
  Herreros: <Wrench size={20} />,
  Yeseros: <Paintbrush size={20} />,
  Pisos: <Building2 size={20} />,
};

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // ── Fetch approved maestros from the backend ──
  const { data: approvedMaestros, isLoading: approvedLoading } = trpc.maestros.list.useQuery();
  const approvedCount = approvedMaestros?.length ?? 0;

  const [activeSection, setActiveSection] = useState("catalogo");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Trade>("Todos");
  const [selectedWorker, setSelectedWorker] = useState<Maestro | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // ── Radius filter state ──
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [isSearchingRadius, setIsSearchingRadius] = useState(false);

  // Seed mock maestros with realistic CDMX zone coordinates
  const MAESTROS_WITH_COORDS: (Maestro & { lat?: number; lng?: number })[] = useMemo(() => {
    // Realistic lat/lng for each zone in CDMX
    const zoneCoords: Record<string, { lat: number; lng: number }> = {
      "Iztapalapa": { lat: 19.3568, lng: -99.0578 },
      "Coyoacán": { lat: 19.3467, lng: -99.1618 },
      "Nezahualcóyotl": { lat: 19.4009, lng: -99.0143 },
      "Gustavo A. Madero": { lat: 19.4876, lng: -99.1104 },
      "Tlalpan": { lat: 19.2969, lng: -99.1718 },
      "Tlahuac": { lat: 19.2854, lng: -99.0164 },
      "Venustiano Carranza": { lat: 19.4332, lng: -99.1046 },
      "Benito Juárez": { lat: 19.3769, lng: -99.1583 },
    };
    return MAESTROS.map((m) => ({
      ...m,
      lat: zoneCoords[m.location]?.lat,
      lng: zoneCoords[m.location]?.lng,
    }));
  }, []);

  // Haversine distance calculation (frontend mirror of server function)
  const haversineKm = useCallback((
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  // Convert API-approved maestros to mock shape for rendering
  const apiMaestros: (Maestro & { _apiId: number; _distance?: number; lat?: number; lng?: number })[] = useMemo(() => {
    if (!approvedMaestros || approvedMaestros.length === 0) return [];
    return approvedMaestros.map(apiRowToMock).map((m) => ({
      ...m,
      lat: (approvedMaestros?.find((r) => r.id === m._apiId) as any)?.latitude,
      lng: (approvedMaestros?.find((r) => r.id === m._apiId) as any)?.longitude,
    }));
  }, [approvedMaestros]);

  // Use API data when available, fall back to mock data
  const sourceMaestros = apiMaestros.length > 0 ? apiMaestros : MAESTROS_WITH_COORDS;

  const filteredMaestros = useMemo(() => {
    let results = sourceMaestros;
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
    // Apply radius filter if user has a location
    if (userLocation) {
      results = results
        .filter((m) => m.lat && m.lng)
        .map((m) => ({
          ...m,
          _distance: haversineKm(
            userLocation.lat, userLocation.lng,
            m.lat!, m.lng!
          ),
        }))
        .filter((m) => m._distance <= radiusKm)
        .sort((a, b) => a._distance - b._distance);
    }
    return results;
  }, [query, activeFilter, userLocation, radiusKm, sourceMaestros, haversineKm]);

  const handleLocationChange = useCallback((location: { lat: number; lng: number } | null, _label: string) => {
    setUserLocation(location);
    setIsSearchingRadius(true);
    // Simulate search delay for UX feedback
    setTimeout(() => setIsSearchingRadius(false), 600);
  }, []);

  const handleRadiusChange = useCallback((radius: number) => {
    setRadiusKm(radius);
    setIsSearchingRadius(true);
    setTimeout(() => setIsSearchingRadius(false), 400);
  }, []);

  // Calculate distance for a maestro for display
  const getDistanceKm = useCallback((worker: Maestro & { lat?: number; lng?: number }): string | null => {
    if (!userLocation || !worker.lat || !worker.lng) return null;
    const km = haversineKm(userLocation.lat, userLocation.lng, worker.lat, worker.lng);
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  }, [userLocation, haversineKm]);

  const navigateToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSelectSuggestion = useCallback((value: string) => {
    const tradeMatch = MAESTROS.find((m) => m.tradeCategory.toLowerCase() === value.toLowerCase());
    if (tradeMatch) setActiveFilter(tradeMatch.tradeCategory as Trade);
  }, []);

  // Navigate to public maestro profile page
  const navigateToProfile = useCallback((worker: Maestro) => {
    const slug = worker.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setLocation(`/maestro/${slug}-${worker.id}`);
  }, [setLocation]);

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
            alt="Profesionales verificados trabajando en el hogar"
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
                  {approvedCount > 0
                    ? `${approvedCount} maestr${approvedCount === 1 ? "o" : "os"} verificado${approvedCount === 1 ? "" : "s"} disponible${approvedCount === 1 ? "" : "s"}`
                    : `${MAESTROS.filter((m) => m.isVerified).length} maestros verificados disponibles`}
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
                maestros={sourceMaestros}
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
                {apiMaestros.length > 0
                  ? `${filteredMaestros.length} maestr${filteredMaestros.length === 1 ? "o" : "os"} verificado${filteredMaestros.length === 1 ? "" : "s"}`
                  : `${filteredMaestros.length} profesional${filteredMaestros.length !== 1 ? "es" : ""} cerca de ti`}
                {approvedLoading && " · cargando..."}
              </p>
            </div>
          </div>

          {/* ── Radius Filter ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-6">
            <RadiusFilter
              userLocation={userLocation}
              onLocationChange={handleLocationChange}
              onRadiusChange={handleRadiusChange}
              radiusKm={radiusKm}
              resultCount={filteredMaestros.length}
              isSearching={isSearchingRadius}
            />
            <FilterPills
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              maestros={filteredMaestros}
              allMaestros={sourceMaestros}
            />
          </div>

          {/* Results Grid — varied card sizes for masonry feel */}
          <div className="mt-8">
            {filteredMaestros.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredMaestros.map((worker, i) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    index={i}
                    distanceKm={getDistanceKm(worker)}
                    onViewProfile={() => navigateToProfile(worker)}
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
              <img
                src="/manus-storage/logo-hexagon_acee6c26.jpeg"
                alt="Maestro Cerca"
                className="w-10 h-10 rounded-md object-cover shadow-sm"
              />
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
              <img
                src="/manus-storage/logo-hexagon_acee6c26.jpeg"
                alt="Maestro Cerca"
                className="w-12 h-12 rounded-md object-cover mb-5 shadow-sm"
              />
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
              <img
                src="/manus-storage/logo-hexagon_acee6c26.jpeg"
                alt="Maestro Cerca"
                className="w-8 h-8 rounded-md object-cover"
              />
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
        onOpenProfile={selectedWorker ? () => navigateToProfile(selectedWorker) : undefined}
      />
      {onboardingOpen && (
        <OnboardingWizard onClose={() => setOnboardingOpen(false)} />
      )}
    </div>
  );
}

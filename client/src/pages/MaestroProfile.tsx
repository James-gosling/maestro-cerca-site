/*
 * DESIGN: Artesanía Digital — full public profile page for each maestro.
 * Accessible at /maestro/:slug (e.g. /maestro/don-chucho-ramirez-5).
 * Features: full gallery, reviews, shareable link, WhatsApp CTA,
 * SEO-friendly meta via document.title.
 */

import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  ShieldCheck,
  Star,
  Clock,
  Briefcase,
  MapPin,
  Phone,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Wrench,
  Zap,
  Building2,
  Paintbrush,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MaestroProfileResponse {
  id: number;
  name: string;
  phone: string;
  trade: string;
  experience: number;
  workType: string;
  zone: string;
  galleryImages: { url: string; caption: string; key: string }[];
  verificationStatus: string;
  idDocumentKey: string | null;
  createdAt: string;
  updatedAt: string;
  slug: string;
  profileUrl: string;
}

const TRADE_ICONS: Record<string, React.ReactNode> = {
  Plomero: <Wrench size={18} />,
  Electricista: <Zap size={18} />,
  Albañil: <Building2 size={18} />,
  Herrero: <Wrench size={18} />,
  Yesero: <Paintbrush size={18} />,
  Pisos: <Building2 size={18} />,
};

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: { url: string; caption: string }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        aria-label="Cerrar"
      >
        <ChevronRight size={28} className="rotate-90" />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <div className="max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[idx].url}
          alt={images[idx].caption}
          className="w-full rounded-2xl object-contain max-h-[75vh]"
        />
        <p className="text-white/80 text-sm text-center mt-3">
          {images[idx].caption}
        </p>
        {images.length > 1 && (
          <p className="text-white/50 text-xs text-center mt-1">
            {idx + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MaestroProfile() {
  const [match, params] = useRoute<{ slug: string }>("/maestro/:slug");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  // If no match, this route wasn't hit — should not happen with correct routing
  if (!match) return null;

  const slug = params.slug;
  const { data: maestro, isLoading, error } = trpc.maestros.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Set document title when maestro loads
  useEffect(() => {
    if (maestro) {
      document.title = `${maestro.name} — ${maestro.trade} | Maestro Cerca`;
    }
    return () => {
      document.title = "Maestro Cerca";
    };
  }, [maestro]);

  const handleShare = async () => {
    if (!maestro) return;
    const url = `${window.location.origin}/maestro/${maestro.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${maestro.name} — ${maestro.trade}`,
          text: `Mira el perfil de ${maestro.name}, ${maestro.trade} verificado en Maestro Cerca`,
          url,
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (!maestro) return;
    const phone = maestro.phone.replace(/\D/g, "");
    const fullPhone = phone.startsWith("52") ? phone : `52${phone}`;
    const message = encodeURIComponent(
      `Hola ${maestro.name}, te encontré en Maestro Cerca y me interesa tu servicio de ${maestro.trade}. ¿Podrías darme más información?`
    );
    window.open(`https://wa.me/${fullPhone}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !maestro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-terracotta/50" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Maestro no encontrado
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Es posible que este perfil ya no esté disponible o que el enlace sea incorrecto.
          </p>
          <Link href="/">
            <button className="bg-terracotta text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-terracotta-dark transition-colors text-sm">
              Volver al catálogo
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = maestro.galleryImages.map((img) => ({
    url: img.url,
    caption: img.caption || "Trabajo realizado",
  }));

  const isVerified = maestro.verificationStatus === "approved";
  const joinedDate = new Date(maestro.createdAt);
  const monthsActive = Math.max(
    1,
    Math.round(
      (Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Volver</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-terracotta rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">MC</span>
              </div>
              <span className="text-sm font-semibold text-foreground font-serif">
                Maestro Cerca
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 to-transparent" />

          <div className="relative container max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-secondary ring-4 ring-background shadow-lg">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(maestro.name)}&background=C46A3A&color=fff&size=200&bold=true`}
                    alt={`Foto de ${maestro.name}`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {/* Verification badge */}
                {isVerified && (
                  <div className="absolute -bottom-1.5 -right-1.5 bg-gold-badge text-white rounded-full p-1 shadow-md">
                    <ShieldCheck size={14} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    {maestro.name}
                  </h1>
                  {isVerified && (
                    <span className="flex-shrink-0 bg-gold-badge/10 text-gold-badge text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gold-badge/30 mt-1">
                      Verificado
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {maestro.trade} · {maestro.experience} años de experiencia
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {maestro.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} />
                    {maestro.workType === "independiente"
                      ? "Trabajo independiente"
                      : "Trabaja en empresa"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {monthsActive} mes{monthsActive !== 1 ? "es" : ""} activo
                    {monthsActive !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery Section ── */}
        {galleryImages.length > 0 && (
          <section className="py-8">
            <div className="container max-w-4xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-0.5 bg-terracotta rounded-full" />
                <h2 className="text-base font-bold text-foreground">
                  Portafolio ({galleryImages.length}{" "}
                  {galleryImages.length === 1 ? "trabajo" : "trabajos"})
                </h2>
              </div>

              <div
                className={`grid gap-3 ${
                  galleryImages.length === 1
                    ? "grid-cols-1"
                    : galleryImages.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className={`relative rounded-xl overflow-hidden group bg-secondary ${
                      galleryImages.length === 1
                        ? "aspect-[16/9]"
                        : "aspect-square"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="absolute bottom-3 left-3 right-3 text-white text-xs leading-snug">
                        {img.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Contact CTA Section ── */}
        <section className="py-6">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-card rounded-2xl border border-border p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ¿Necesitas un{" "}
                  {maestro.trade.toLowerCase()}?
                </p>
                <p className="text-xs text-muted-foreground">
                  Contacta directamente con {maestro.name.split(" ")[0]} y
                  solicita tu presupuesto sin compromiso.
                </p>
              </div>
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto bg-emerald-brand text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-brand/90 transition-colors active:scale-[0.97] text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* ── About Section ── */}
        <section className="py-6">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-0.5 bg-terracotta rounded-full" />
              <h2 className="text-base font-bold text-foreground">
                Sobre este maestro
              </h2>
            </div>

            <div className="bg-secondary/50 rounded-xl p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-terracotta">
                    {maestro.experience}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Años experiencia
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-terracotta">
                    {monthsActive}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Mes{monthsActive !== 1 ? "es" : ""} activo
                    {monthsActive !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-terracotta">
                    {isVerified ? "Sí" : "Pendiente"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Verificado
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-terracotta">
                    {maestro.workType === "independiente" ? "Ind." : "Emp."}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tipo trabajo
                  </p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {maestro.trade === "Plomero"
                    ? "Profesional especializado en instalación y reparación de sistemas de plomería residencial. Experiencia en detección de fugas, destape de drenajes, instalación de calentadores y sanitarios."
                    : maestro.trade === "Electricista"
                    ? "Profesional especializado en instalaciones eléctricas residenciales e industriales. Cumplimiento de normas NOM y CFE. Experiencia en paneles solares y sistemas domóticos."
                    : maestro.trade === "Albañil"
                    ? "Profesional con amplia experiencia en obra residencial y comercial. Especialista en acabados finos, pisos, mampostería y concreto. Equipo completo disponible."
                    : maestro.trade === "Herrero"
                    ? "Profesional especializado en fabricación e instalación de puertas, rejas, escaleras y protecciones metálicas. Trabajo con acero inoxidable y hierro forjado."
                    : maestro.trade === "Yesero"
                    ? "Profesional especializado en plafones de tablaroca, aplanados finos y decoración interior. Trabajo limpio y rápido con acabados de primera calidad."
                    : "Profesional con experiencia comprobada en su oficio. Trabajo de calidad con materiales de primera."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-6 border-t border-border/50 bg-card/50 mt-8">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-terracotta rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-[7px]">MC</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Perfil público de Maestro Cerca
                </span>
              </div>
              <button
                onClick={handleShare}
                className="text-xs text-terracotta hover:text-terracotta-dark transition-colors flex items-center gap-1"
              >
                <Share2 size={12} />
                {copied ? "Enlace copiado" : "Compartir este perfil"}
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <Lightbox
          images={galleryImages}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

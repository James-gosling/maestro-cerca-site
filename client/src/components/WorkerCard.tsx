/*
 * DESIGN: Artesanía Digital — warm navy palette, rounded stone corners,
 * avatar-anchored trust badges, scannable skill tags, dual-CTA layout.
 * Signature: navy gradient border on hover, MC seal on verified cards.
 */

import { Star, ShieldCheck, MapPin, Zap, Briefcase } from "lucide-react";
import type { Maestro } from "@/data/mockMaestros";
import { calculateTier } from "@shared/tierUtils";
import SafeImage from "./SafeImage";

interface WorkerCardProps {
  worker: Maestro;
  onViewProfile: () => void;
  onContact: () => void;
  index: number;
  distanceKm?: string | null;
  /** Optional set of maestro IDs already unlocked by the current user */
  unlockedIds?: Set<number>;
}

const availabilityConfig = {
  "Disponible hoy": { color: "text-emerald-600", dot: "bg-emerald-500", label: "Disponible hoy" },
  "Alta respuesta": { color: "text-blue-600", dot: "bg-blue-500", label: "Alta respuesta" },
  "Ocupado": { color: "text-gray-400", dot: "bg-gray-400", label: "Ocupado" },
} as const;

/** Extract first-and-last-name initials for an avatar fallback. */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export default function WorkerCard({ worker, onViewProfile, onContact, index, distanceKm, unlockedIds }: WorkerCardProps) {
  const workerId = (worker as any)?._apiId ?? (worker as any)?.id;
  const isContactUnlocked = typeof workerId === "number" && unlockedIds?.has(workerId) === true;
  const safeAvailability = worker.availability || "Disponible hoy";
  const avail = availabilityConfig[safeAvailability] || availabilityConfig["Disponible hoy"];
  const safeName = worker.name || "Maestro";
  const safeTrade = worker.trade || "Oficio";
  const safeSkills = Array.isArray(worker.skills) ? worker.skills : [];
  const safeExperience = worker.experienceYears ?? 0;
  const safeRating = typeof worker.rating === "number" ? worker.rating : 4.5;
  const safeReviewCount = typeof worker.reviewCount === "number" ? worker.reviewCount : 0;
  const safeCompletedJobs = typeof worker.completedJobs === "number" ? worker.completedJobs : 0;
  const safeLocation = worker.location || "Ubicación no disponible";
  const initials = getInitials(safeName);

  return (
    <article
      className="flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:warm-shadow-lg hover:border-navy/25 focus-within:r[...]
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`Perfil de ${safeName}, ${safeTrade}`}
    >
      {/* ── Image & Overlaid Badges ── */}
      <div className="relative h-48 sm:h-52 w-full bg-sand overflow-hidden">
        <SafeImage
          src={worker.imageUrl || undefined}
          alt={`Foto de perfil de ${safeName}`}
          className="w-full h-full object-cover"
          fallbackInitials={initials}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {(() => {
          const tierInfo = calculateTier({
            points: (worker as any)?.points || 0,
            referencesCount: (worker as any)?.referencesCount || 0,
            reviewsCount: safeReviewCount,
            verificationStatus: worker.isVerified ? "approved" : "pending",
          });

          // Nivel 3: Sello Maestro — gold badge overlaid on avatar (top-left)
          if (tierInfo.level === 3) {
            return (
              <div className="absolute top-3 left-3 z-10">
                <div className={`flex items-center gap-1 bg-gradient-to-r ${tierInfo.badgeColors} text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-lg select-none border-2 border-amber-400`}[...]
                  <Star size={12} className="flex-shrink-0 text-amber-600 fill-amber-500" />
                  {tierInfo.name}
                </div>
              </div>
            );
          }

          // Nivel 2: Profesional Verificado — blue/emerald shield badge
          if (tierInfo.level === 2) {
            return (
              <div className="absolute top-3 left-3 z-10">
                <div className={`flex items-center gap-1 bg-gradient-to-r ${tierInfo.badgeColors} text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-md select-none border`}>
                  <ShieldCheck size={12} strokeWidth={2.5} className="flex-shrink-0 text-emerald-600" />
                  {tierInfo.name}
                </div>
              </div>
            );
          }

          // Nivel 1: Aspirante — subtle neutral label
          return (
            <div className="absolute top-3 left-3 z-10">
              <div className={`flex items-center gap-1 bg-gradient-to-r ${tierInfo.badgeColors} text-[10px] font-medium px-2 py-1 rounded-full shadow-sm select-none border`}>
                {tierInfo.name}
              </div>
            </div>
          );
        })()}

        {/* Rating — bottom-right with star fill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-warm-charcoal text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          {safeRating.toFixed(1)}
          <span className="text-muted-foreground font-normal">({safeReviewCount})</span>
        </div>

        {/* Pulsing green dot — "Contacto Desbloqueado" indicator (top-right) */}
        {isContactUnlocked && (
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5"
            title="Contacto Desbloqueado"
            aria-label="Contacto Desbloqueado"
          >
            <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Desbloqueado
            </span>
            <span className="relative flex h-3 w-3" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3">
        {/* Name & Trade */}
        <div>
          <h3 className="text-[15px] font-bold text-foreground leading-snug font-sans tracking-tight">
            {safeName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy">
              {safeTrade}
            </p>
            <span className="text-[11px] text-muted-foreground">
              · {safeExperience} años
            </span>
          </div>
        </div>

        {/* Scannable Skill Tags */}
        <div className="flex flex-wrap gap-1.5" aria-label="Habilidades">
          {safeSkills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="bg-navy/6 text-navy text-[11px] font-medium px-2.5 py-1 rounded-md border border-navy/12"
            >
              {skill}
            </span>
          ))}
          {safeSkills.length > 3 && (
            <span className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-md border border-border">
              +{safeSkills.length - 3} más
            </span>
          )}
        </div>

        {/* Completed jobs — adds social proof */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase size={12} className="text-muted-foreground/60 flex-shrink-0" />
          <span>{safeCompletedJobs} trabajos completados</span>
        </div>

        {/* Location, Distance & Availability */}
        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={13} className="text-muted-foreground/50 flex-shrink-0" />
              <span>{safeLocation}</span>
            </div>
            {distanceKm && (
              <span className="bg-navy/8 text-navy text-[11px] font-semibold px-2 py-0.5 rounded-full border border-navy/15 flex items-center gap-1">
                <MapPin size={10} className="text-navy" />
                {distanceKm}
              </span>
            )}
          </div>
          <div className={`flex items-center gap-1.5 font-medium ${avail.color}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${avail.dot}`} />
            {avail.label}
          </div>
        </div>

        {/* CTA Buttons — dual action pattern */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onViewProfile}
            className="w-full py-2.5 text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-secondary hover:border-navy/20 transition-all active:scale-[0.97][...]
          >
            Ver Perfil
          </button>
          <button
            onClick={onContact}
            className="w-full py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-dark transition-all shadow-sm active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring[...]
          >
            <Zap size={13} strokeWidth={2.5} />
            Contactar
          </button>
        </div>
      </div>
    </article>
  );
}

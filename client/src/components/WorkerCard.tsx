/*
 * DESIGN: Artesanía Digital — warm terracotta palette, rounded stone corners,
 * avatar-anchored trust badges, scannable skill tags, dual-CTA layout.
 * Signature: terracotta gradient border on hover, MC seal on verified cards.
 */

import { Star, ShieldCheck, MapPin, Zap, Briefcase } from "lucide-react";
import type { Maestro } from "@/data/mockMaestros";

interface WorkerCardProps {
  worker: Maestro;
  onViewProfile: () => void;
  onContact: () => void;
  index: number;
}

const availabilityConfig = {
  "Disponible hoy": { color: "text-emerald-600", dot: "bg-emerald-500", label: "Disponible hoy" },
  "Alta respuesta": { color: "text-blue-600", dot: "bg-blue-500", label: "Alta respuesta" },
  "Ocupado": { color: "text-gray-400", dot: "bg-gray-400", label: "Ocupado" },
} as const;

export default function WorkerCard({ worker, onViewProfile, onContact, index }: WorkerCardProps) {
  const avail = availabilityConfig[worker.availability];

  return (
    <article
      className="flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:warm-shadow-lg hover:border-terracotta/25 focus-within:ring-2 focus-within:ring-terracotta/20"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`Perfil de ${worker.name}, ${worker.trade}`}
    >
      {/* ── Image & Overlaid Badges ── */}
      <div className="relative h-48 sm:h-52 w-full bg-sand overflow-hidden">
        <img
          src={worker.imageUrl}
          alt={`Foto de perfil de ${worker.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Sello Maestro — terracotta-toned badge */}
        {worker.isVerified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-amber-800 text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-md select-none border border-amber-300/40">
            <ShieldCheck size={11} strokeWidth={2.5} className="text-amber-600" />
            Sello Maestro
          </div>
        )}

        {/* Rating — bottom-right with star fill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-warm-charcoal text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          {worker.rating.toFixed(1)}
          <span className="text-muted-foreground font-normal">({worker.reviewCount})</span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow gap-3">
        {/* Name & Trade */}
        <div>
          <h3 className="text-[15px] font-bold text-foreground leading-snug font-sans tracking-tight">
            {worker.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              {worker.trade}
            </p>
            <span className="text-[11px] text-muted-foreground">
              · {worker.experienceYears} años
            </span>
          </div>
        </div>

        {/* Scannable Skill Tags */}
        <div className="flex flex-wrap gap-1.5" aria-label="Habilidades">
          {worker.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="bg-terracotta/6 text-terracotta text-[11px] font-medium px-2.5 py-1 rounded-md border border-terracotta/12"
            >
              {skill}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-md border border-border">
              +{worker.skills.length - 3} más
            </span>
          )}
        </div>

        {/* Completed jobs — adds social proof */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase size={12} className="text-muted-foreground/60 flex-shrink-0" />
          <span>{worker.completedJobs} trabajos completados</span>
        </div>

        {/* Location & Availability */}
        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={13} className="text-muted-foreground/50 flex-shrink-0" />
            <span>{worker.location}</span>
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
            className="w-full py-2.5 text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-secondary hover:border-terracotta/20 transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-terracotta/20"
          >
            Ver Perfil
          </button>
          <button
            onClick={onContact}
            className="w-full py-2.5 text-sm font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-all shadow-sm active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-terracotta/40 flex items-center justify-center gap-1.5"
          >
            <Zap size={13} strokeWidth={2.5} />
            Contactar
          </button>
        </div>
      </div>
    </article>
  );
}

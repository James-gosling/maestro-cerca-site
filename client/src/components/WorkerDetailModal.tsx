/*
 * DESIGN: Artesanía Digital — full-screen modal with reordered trust-first layout.
 * Implements audit P1: reviews/gallery above fold, partial phone reveal,
 * sticky bottom CTA on mobile. Lightbox for gallery images.
 */

import { useState } from "react";
import { X, Star, ShieldCheck, Clock, Briefcase, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import type { Maestro } from "@/data/mockMaestros";

interface WorkerDetailModalProps {
  worker: Maestro | null;
  onClose: () => void;
}

function Lightbox({ images, initialIndex, onClose }: { images: { url: string; caption: string }[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white" aria-label="Cerrar">
        <X size={28} />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      <div className="max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx].url} alt={images[idx].caption} className="w-full rounded-2xl object-contain max-h-[75vh]" />
        <p className="text-white/80 text-sm text-center mt-3">{images[idx].caption}</p>
      </div>
    </div>
  );
}

export default function WorkerDetailModal({ worker, onClose }: WorkerDetailModalProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!worker) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal Content */}
        <div className="relative bg-card w-full md:max-w-2xl md:rounded-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm hover:bg-background text-foreground rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          {/* Hero with partial phone reveal */}
          <div className="relative">
            <img
              src={worker.imageUrl}
              alt={`Foto de ${worker.name}`}
              className="w-full h-48 sm:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-xl font-bold text-white">{worker.name}</h2>
              <p className="text-sm text-white/80 font-medium">
                {worker.trade} · {worker.experienceYears} años de experiencia
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-white text-sm">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {worker.rating} ({worker.reviewCount} reseñas)
                </div>
                <div className="flex items-center gap-1 text-white/70 text-sm">
                  <MapPin size={14} />
                  {worker.location}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Verification Badge */}
            {worker.isVerified && (
              <div className="flex items-center gap-2 bg-gold-badge/10 border border-gold-badge/30 rounded-xl px-4 py-3">
                <ShieldCheck size={20} className="text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Sello Maestro Verificado</p>
                  <p className="text-xs text-muted-foreground">
                    Identidad, documentos y antecedentes verificados por Maestro Cerca
                  </p>
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <Briefcase size={18} className="mx-auto text-terracotta mb-1" />
                <p className="text-lg font-bold text-foreground">{worker.completedJobs}</p>
                <p className="text-[11px] text-muted-foreground">Trabajos</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <Clock size={18} className="mx-auto text-terracotta mb-1" />
                <p className="text-sm font-bold text-foreground">{worker.responseTime}</p>
                <p className="text-[11px] text-muted-foreground">Respuesta</p>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <Star size={18} className="mx-auto text-terracotta mb-1" />
                <p className="text-lg font-bold text-foreground">{worker.rating}</p>
                <p className="text-[11px] text-muted-foreground">Calificación</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Sobre este maestro</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{worker.bio}</p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Habilidades</h3>
              <div className="flex flex-wrap gap-1.5">
                {worker.skills.map((s, i) => (
                  <span key={i} className="bg-primary/8 text-terracotta text-xs font-medium px-2.5 py-1 rounded-md border border-primary/15">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {worker.galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Trabajos realizados</h3>
                <div className="grid grid-cols-3 gap-2">
                  {worker.galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIdx(i)}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews — ABOVE CTA per audit recommendation */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Reseñas ({worker.reviews.length})
              </h3>
              <div className="space-y-3">
                {worker.reviews.map((r, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{r.author}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={12}
                            className={j < r.rating ? "text-amber-400 fill-amber-400" : "text-muted"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar — CTA with partial phone reveal */}
          <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Precio estimado</p>
              <p className="text-sm font-bold text-foreground">{worker.hourlyRate}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm font-mono font-medium text-foreground">{worker.phonePartial}</p>
            </div>
            <button
              className="bg-terracotta text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-terracotta-dark transition-colors active:scale-[0.97] shadow-sm flex-shrink-0"
            >
              Desbloquear
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={worker.galleryImages}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

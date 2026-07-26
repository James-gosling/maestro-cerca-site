/*
 * DESIGN: Artesanía Digital — comparison table with highlighted center column.
 * Fixes audit P0 copy inconsistency: free plan now shows "1 contacto gratis/sem"
 * instead of claiming "Contacto directo desbloqueado".
 * Highlighted column for the recommended plan.
 */

import { Check, X, ShieldCheck } from "lucide-react";

const plans = [
  {
    name: "Gratuito",
    price: "$0",
    period: "",
    description: "Explora sin costo",
    highlight: false,
    features: [
      { name: "Ver perfiles de maestros", included: true },
      { name: "Contacto directo desbloqueado", included: false },
      { name: "1 contacto gratis por semana", included: true },
      { name: "Reseñas y calificaciones", included: true },
      { name: "Soporte por chat", included: false },
      { name: "Promoción destacada", included: false },
      { name: "Reporte de validación", included: true },
      { name: "Galería de trabajos", included: true },
    ],
  },
  {
    name: "Pago Único",
    price: "$39",
    period: "MXN",
    description: "Recomendado",
    highlight: true,
    features: [
      { name: "Ver perfiles de maestros", included: true },
      { name: "Contacto directo desbloqueado", included: true },
      { name: "1 contacto gratis por semana", included: true },
      { name: "Reseñas y calificaciones", included: true },
      { name: "Soporte por chat", included: true },
      { name: "Promoción destacada", included: false },
      { name: "Reporte de validación", included: true },
      { name: "Garantía de 30 días", included: true },
      { name: "Galería de trabajos", included: true },
    ],
  },
  {
    name: "Cuadrilla",
    price: "$299",
    period: "MXN/mes",
    description: "Para proyectos grandes",
    highlight: false,
    features: [
      { name: "Ver perfiles de maestros", included: true },
      { name: "Contacto directo desbloqueado", included: true },
      { name: "1 contacto gratis por semana", included: true },
      { name: "Reseñas y calificaciones", included: true },
      { name: "Soporte por chat", included: true },
      { name: "Promoción destacada", included: true },
      { name: "Reporte de validación", included: true },
      { name: "Garantía de 30 días", included: true },
      { name: "Galería de trabajos", included: true },
    ],
  },
];

// Get all unique feature names
const allFeatures = Array.from(
  new Set(plans.flatMap((p) => p.features.map((f) => f.name)))
);

function getFeature(name: string, plan: typeof plans[0]) {
  const f = plan.features.find((feat) => feat.name === name);
  return f?.included ?? false;
}

export default function PricingComparison() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[640px] bg-card rounded-2xl border border-border/50 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_140px_140px_140px] border-b border-border/50">
          <div className="p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Características</p>
          </div>
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-5 text-center ${
                p.highlight ? "bg-terracotta/5 border-x border-terracotta/15" : ""
              }`}
            >
              {p.highlight && (
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <ShieldCheck size={12} className="text-terracotta" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">Recomendado</span>
                </div>
              )}
              <p className="text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {p.price} {p.period && <span className="font-normal">{p.period}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Rows */}
        {allFeatures.map((feature, i) => (
          <div
            key={feature}
            className={`grid grid-cols-[1fr_140px_140px_140px] border-b border-border/30 last:border-b-0 ${
              i % 2 === 0 ? "bg-muted/15" : ""
            }`}
          >
            <div className="p-3.5 flex items-center">
              <p className="text-sm text-foreground">{feature}</p>
            </div>
            {plans.map((p) => {
              const included = getFeature(feature, p);
              return (
                <div
                  key={p.name}
                  className={`p-3.5 text-center flex items-center justify-center ${
                    p.highlight ? "bg-terracotta/5 border-x border-terracotta/15" : ""
                  }`}
                >
                  {included ? (
                    <div className="w-5 h-5 bg-emerald-brand/10 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-emerald-brand" />
                    </div>
                  ) : (
                    <X size={16} className="text-muted-foreground/30" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

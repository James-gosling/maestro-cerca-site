import type { Maestro } from "./types";
import React from "react";
import { ShieldCheck } from "lucide-react";

export type TierLevel = 1 | 2 | 3;

export interface TierInfo {
  level: TierLevel;
  name: string;
  badgeColors: string;
  cardColors: string;
}

export function calculateTier(worker: {
  points?: number;
  referencesCount?: number;
  reviewsCount?: number;
  verificationStatus?: string | null;
}): TierInfo {
  const points = worker.points || 0;
  const references = worker.referencesCount || 0;
  const reviews = worker.reviewsCount || 0;
  
  // Tier 3: Sello Maestro (The Elite)
  // Unlocked at 10+ job references + 5–10 5-star reviews (or >= 150 points for fallback gamification)
  if ((references >= 10 && reviews >= 5) || points >= 150) {
    return {
      level: 3,
      name: "Sello Maestro",
      badgeColors: "from-amber-200 to-amber-100 text-amber-900 border-amber-300",
      cardColors: "bg-amber-50 border-amber-200 text-amber-900",
    };
  }

  // Tier 2: Profesional Verificado
  // Unlocked at 3–5 job references + 1–3 client reviews, OR if they are approved by admin/points
  if ((references >= 3 && reviews >= 1) || points >= 50 || worker.verificationStatus === "approved") {
    return {
      level: 2,
      name: "Profesional Verificado",
      badgeColors: "from-emerald-100 to-teal-50 text-emerald-900 border-emerald-300",
      cardColors: "bg-emerald-50 border-emerald-200 text-emerald-900",
    };
  }

  // Tier 1: Aspirante
  return {
    level: 1,
    name: "Aspirante",
    badgeColors: "from-gray-100 to-gray-50 text-gray-700 border-gray-300",
    cardColors: "bg-gray-50 border-gray-200 text-gray-700",
  };
}

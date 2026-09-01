import { QUERETARO_CATALOG, type QueretaroCatalogProfile } from "@shared/queretaroCatalog";

export interface Maestro {
  id: string;
  name: string;
  trade: string;
  tradeCategory: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  location: string;
  availability: "Disponible hoy" | "Alta respuesta" | "Ocupado";
  imageUrl: string;
  isVerified: boolean;
  bio: string;
  galleryImages: { url: string; caption: string }[];
  reviews: { author: string; text: string; rating: number; date: string }[];
  phonePartial: string;
  phone?: string | null;
  hourlyRate: string;
  completedJobs: number;
  responseTime: string;
  points?: number;
  referencesCount?: number;
  reviewsCount?: number;
  verificationStatus?: string | null;
}

const TRADE_CATEGORIES: Record<QueretaroCatalogProfile["trade"], string> = {
  Plomero: "Plomeros",
  Electricista: "Electricistas",
  Carpintero: "Carpinteros",
  Pintor: "Pintores",
  Albañil: "Albañiles",
};

const maskPhone = (phone: string) => `+52 ${phone.slice(0, 3)} **** ${phone.slice(-3)}`;

/** Fallback catalog uses real-looking identities but no fabricated user-generated content. */
export const MAESTROS: Maestro[] = QUERETARO_CATALOG.map((profile) => ({
  id: `seed-${profile.seedKey}`,
  name: profile.name,
  trade: profile.trade,
  tradeCategory: TRADE_CATEGORIES[profile.trade],
  experienceYears: profile.experience,
  rating: 0,
  reviewCount: 0,
  skills: [...profile.skills],
  location: profile.zone,
  availability: profile.availability,
  imageUrl: "",
  isVerified: profile.verificationStatus === "approved",
  bio: profile.bio,
  galleryImages: [],
  reviews: [],
  phonePartial: maskPhone(profile.phone),
  phone: profile.phone,
  hourlyRate: profile.hourlyRate,
  completedJobs: 0,
  responseTime: profile.responseTime,
  points: 0,
  referencesCount: 0,
  reviewsCount: 0,
  verificationStatus: profile.verificationStatus,
}));

export const TRADES = ["Todos", "Plomeros", "Electricistas", "Carpinteros", "Pintores", "Albañiles"] as const;
export type Trade = (typeof TRADES)[number];

export const TRENDING_REPAIRS = [
  "Fuga de agua",
  "Corto circuito",
  "Pintura de interiores",
  "Instalación de calentador",
  "Destape de drenaje",
  "Mueble a medida",
  "Aplanado de paredes",
  "Piso de porcelanato",
];

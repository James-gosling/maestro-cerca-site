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
  hourlyRate: string;
  completedJobs: number;
  responseTime: string;
  points?: number;
  referencesCount?: number;
  reviewsCount?: number;
  verificationStatus?: string | null;
}

export const MAESTROS: Maestro[] = [
  {
    id: "m1",
    name: "Don Chucho Ramírez",
    trade: "Plomero",
    tradeCategory: "Plomeros",
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 143,
    skills: ["Cobre", "PVC", "Emergencias 24/7", "Gas LP"],
    location: "Iztapalapa",
    availability: "Disponible hoy",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Plomero certificado con 18 años de experiencia en instalaciones residenciales y comerciales. Especialista en detección de fugas ocultas y sistemas de agua caliente. Trabajo garantizado con materiales de primera calidad.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600", caption: "Instalación de tubería PVC · Iztapalapa · 2025" },
      { url: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600", caption: "Reparación de calentador solar · CDMX · 2025" },
      { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600", caption: "Detección de fuga con equipo profesional · 2024" },
    ],
    reviews: [
      { author: "María G.", text: "Excelente trabajo, llegó puntual y resolvió el problema en menos de una hora. Muy profesional.", rating: 5, date: "2026-06-15" },
      { author: "Roberto L.", text: "Don Chucho es muy confiable. Ya lo he llamado 3 veces y siempre queda perfecto.", rating: 5, date: "2026-05-22" },
      { author: "Ana P.", text: "Buen trabajo, aunque llegó 15 minutos tarde. El resultado fue muy bueno.", rating: 4, date: "2026-04-10" },
    ],
    phonePartial: "+52 55 **** 0001",
    hourlyRate: "$500 – $800 MXN/hr",
    completedJobs: 312,
    responseTime: "< 30 min",
  },
  {
    id: "m2",
    name: "Ingeniero Marco Torres",
    trade: "Electricista",
    tradeCategory: "Electricistas",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 97,
    skills: ["Residencial", "Industrial", "Domótica", "Paneles solares"],
    location: "Coyoacán",
    availability: "Disponible hoy",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Ingeniero electricista titulado con especialidad en instalaciones residenciales inteligentes. Instalación de paneles solares y sistemas domóticos. Cumplimiento total de normas NOM y CFE.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600", caption: "Instalación de panel solar · Coyoacán · 2025" },
      { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600", caption: "Centro de carga residencial · 2025" },
    ],
    reviews: [
      { author: "Carlos M.", text: "Instaló todo el sistema eléctrico de mi casa nueva. Trabajo impecable y muy ordenado.", rating: 5, date: "2026-06-01" },
      { author: "Lucía R.", text: "Muy buen electricista, sabe explicar todo lo que hace. Recomendado.", rating: 5, date: "2026-05-15" },
    ],
    phonePartial: "+52 55 **** 0002",
    hourlyRate: "$600 – $1,000 MXN/hr",
    completedJobs: 189,
    responseTime: "< 45 min",
  },
  {
    id: "m3",
    name: "Maestro Pablo Herrera",
    trade: "Albañil",
    tradeCategory: "Albañiles",
    experienceYears: 22,
    rating: 4.7,
    reviewCount: 201,
    skills: ["Mampostería", "Pisos", "Aplanados", "Concreto"],
    location: "Nezahualcóyotl",
    availability: "Alta respuesta",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Maestro albañil con más de dos décadas de experiencia en obra residencial y comercial. Especialista en acabados finos, pisos de mármol y granito. Equipo completo de 4 ayudantes.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600", caption: "Acabado de piso de mármol · Nezahualcóyotl · 2025" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", caption: "Construcción de muro de contención · 2024" },
    ],
    reviews: [
      { author: "Jorge T.", text: "El mejor albañil que he contratado. Sus acabados son de primera.", rating: 5, date: "2026-05-30" },
    ],
    phonePartial: "+52 55 **** 0003",
    hourlyRate: "$400 – $700 MXN/hr",
    completedJobs: 445,
    responseTime: "< 2 hrs",
  },
  {
    id: "m4",
    name: "Don Rafael Guzmán",
    trade: "Herrero",
    tradeCategory: "Herreros",
    experienceYears: 15,
    rating: 4.6,
    reviewCount: 78,
    skills: ["Puertas", "Rejas", "Escaleras", "Protecciones"],
    location: "Gustavo A. Madero",
    availability: "Disponible hoy",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=face",
    isVerified: false,
    bio: "Herrero artesanal con 15 años de experiencia en fabricación e instalación de puertas, rejas y escaleras metálicas. Trabajo con acero inoxidable y hierro forjado. Presupuestos sin compromiso.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600", caption: "Reja de seguridad · GAM · 2025" },
    ],
    reviews: [
      { author: "Patricia S.", text: "Don Rafael hizo una reja hermosa para mi casa. Muy recomendado.", rating: 5, date: "2026-04-20" },
    ],
    phonePartial: "+52 55 **** 0004",
    hourlyRate: "$450 – $750 MXN/hr",
    completedJobs: 156,
    responseTime: "< 1 hr",
  },
  {
    id: "m5",
    name: "Miguel Ángel Cruz",
    trade: "Electricista",
    tradeCategory: "Electricistas",
    experienceYears: 8,
    rating: 4.5,
    reviewCount: 54,
    skills: ["Residencial", "Circuitos", "Instalaciones nuevas", "Averiados"],
    location: "Tlalpan",
    availability: "Alta respuesta",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Electricista certificado especializado en reparaciones residenciales y instalaciones nuevas. Trabajo limpio y ordenado. Precio justo sin sorpresas.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600", caption: "Instalación de contactos · Tlalpan · 2025" },
    ],
    reviews: [
      { author: "Sofía D.", text: "Muy buen servicio, resolvió un corto circuito que otros no pudieron.", rating: 5, date: "2026-06-10" },
    ],
    phonePartial: "+52 55 **** 0005",
    hourlyRate: "$450 – $650 MXN/hr",
    completedJobs: 87,
    responseTime: "< 1 hr",
  },
  {
    id: "m6",
    name: "Don Arturo Méndez",
    trade: "Plomero",
    tradeCategory: "Plomeros",
    experienceYears: 25,
    rating: 4.8,
    reviewCount: 167,
    skills: ["Destape de drenajes", "Instalación", "Calentadores", "Sanitarios"],
    location: "Tlahuac",
    availability: "Disponible hoy",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Plomero con un cuarto de siglo de experiencia. Especialista en destape de drenajes con equipo de alta presión. Instalación de calentadores y sanitarios. Garantía por escrito en todos los trabajos.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=600", caption: "Destape de drenaje principal · Tláhuac · 2025" },
      { url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600", caption: "Instalación de calentador de paso · 2025" },
    ],
    reviews: [
      { author: "Fernanda H.", text: "Don Arturo es un señor muy honesto. Cobró exactamente lo que presupuestó.", rating: 5, date: "2026-06-18" },
      { author: "Ricardo V.", text: "Destapó el drenaje de mi casa en 30 minutos. Muy eficiente.", rating: 5, date: "2026-05-05" },
    ],
    phonePartial: "+52 55 **** 0006",
    hourlyRate: "$450 – $700 MXN/hr",
    completedJobs: 389,
    responseTime: "< 20 min",
  },
  {
    id: "m7",
    name: "Yesero Juan",
    trade: "Yesero",
    tradeCategory: "Yeseros",
    experienceYears: 10,
    rating: 4.4,
    reviewCount: 32,
    skills: ["Plafones", "Tablaroca", "Aplanados", "Decoración"],
    location: "Venustiano Carranza",
    availability: "Alta respuesta",
    imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&h=600&fit=crop&crop=face",
    isVerified: false,
    bio: "Yesero especializado en plafones de tablaroca, aplanados finos y decoración interior. Trabajo limpio y rápido. Presupuestos gratuitos.",
    galleryImages: [],
    reviews: [
      { author: "Diana R.", text: "Buen trabajo en el plafón de mi sala. Se ve muy bien.", rating: 4, date: "2026-05-12" },
    ],
    phonePartial: "+52 55 **** 0007",
    hourlyRate: "$350 – $550 MXN/hr",
    completedJobs: 64,
    responseTime: "< 2 hrs",
  },
  {
    id: "m8",
    name: "Maestro Fernando Luna",
    trade: "Pisos",
    tradeCategory: "Pisos",
    experienceYears: 14,
    rating: 4.7,
    reviewCount: 89,
    skills: ["Porcelanato", "Cerámica", "Madera", "Vinílica"],
    location: "Benito Juárez",
    availability: "Disponible hoy",
    imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=600&fit=crop&crop=face",
    isVerified: true,
    bio: "Especialista en instalación de todo tipo de pisos: porcelanato, cerámica, madera y vinílica. Nivelación profesional y acabados impecables. Referencias disponibles.",
    galleryImages: [
      { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600", caption: "Piso de porcelanato · Benito Juárez · 2025" },
      { url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600", caption: "Instalación de piso de madera · 2024" },
    ],
    reviews: [
      { author: "Alejandra M.", text: "Piso perfecto, sin una sola imperfección. Don Fernando es un verdadero maestro.", rating: 5, date: "2026-06-05" },
    ],
    phonePartial: "+52 55 **** 0008",
    hourlyRate: "$400 – $650 MXN/hr",
    completedJobs: 201,
    responseTime: "< 30 min",
  },
];

export const TRADES = ["Todos", "Plomeros", "Electricistas", "Albañiles", "Herreros", "Yeseros", "Pisos"] as const;
export type Trade = (typeof TRADES)[number];

export const TRENDING_REPAIRS = [
  "Fuga de agua",
  "Corto circuito",
  "Impermeabilización de azotea",
  "Instalación de calentador",
  "Destape de drenaje",
  "Aplanado de paredes",
  "Piso de porcelanato",
  "Reja de seguridad",
];

import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { maestros, type InsertMaestro } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { adminProcedure, publicProcedure, router, protectedProcedure } from "../_core/trpc";

/**
 * Haversine formula: calculate distance in km between two lat/lng points.
 * Used server-side for radius filtering.
 */
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Geocode a zone/neighborhood name to lat/lng using Google Maps Geocoding API.
 * Used to geocode user's location for radius search.
 */
async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const { makeRequest } = await import("../_core/map");
    const data = await makeRequest<{ results?: Array<{ geometry: { location: { lat: number; lng: number } } }> }>(
      "/maps/api/geocode/json",
      { address: `${query}, Ciudad de México, México` }
    );
    if (data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a URL-safe slug from a maestro name.
 * e.g. "Don Chucho Ramírez" → "don-chucho-ramirez"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const maestrosRouter = router({
  /**
   * Get a maestro's public profile by their slug or numeric ID.
   * Slug format: /maestro/don-chucho-ramirez-5
   * Falls back to numeric ID if slug doesn't match.
   */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Parse the slug: last segment after the last hyphen is the ID
      const parts = input.slug.split("-");
      const idPart = parts[parts.length - 1];
      const numericId = parseInt(idPart, 10);

      if (isNaN(numericId) || numericId < 1) return null;

      const rows = await db
        .select()
        .from(maestros)
        .where(
          and(
            eq(maestros.id, numericId),
            eq(maestros.verificationStatus, "approved")
          )
        )
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        ...row,
        slug: `${slugify(row.name)}-${row.id}`,
        profileUrl: `/maestro/${slugify(row.name)}-${row.id}`,
        galleryImages: row.galleryImages
          ? (row.galleryImages as { url: string; caption: string; key: string }[])
          : [],
      };
    }),

  /**
   * Register a new maestro with their details and optional gallery photos.
   * Photos are uploaded to S3 and stored as JSON array of { url, caption, key }.
   */
  register: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        phone: z.string().min(10).max(20),
        trade: z.string().min(2).max(50),
        experience: z.number().int().min(0).max(50),
        workType: z.enum(["independiente", "empresa"]).default("independiente"),
        zone: z.string().min(2).max(100),
        galleryImages: z
          .array(
            z.object({
              url: z.string(),
              caption: z.string().max(200),
              key: z.string(),
            })
          )
          .optional(),
        idDocumentKey: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const insertData: InsertMaestro = {
        userId: ctx.user.id,
        name: input.name,
        phone: input.phone,
        trade: input.trade,
        experience: input.experience,
        workType: input.workType,
        zone: input.zone,
        galleryImages: input.galleryImages && input.galleryImages.length > 0
          ? input.galleryImages
          : null,
        idDocumentKey: input.idDocumentKey,
        latitude: input.latitude,
        longitude: input.longitude,
        verificationStatus: "pending",
      };

      const result = await db.insert(maestros).values(insertData);

      return {
        id: result[0].insertId,
        success: true,
        message: "Registro enviado. Tu perfil será revisado y aprobado en las próximas 24-48 horas.",
      };
    }),

  /**
   * Upload a single photo to S3 and return the stored URL.
   * Accepts base64-encoded image data.
   */
  uploadPhoto: publicProcedure
    .input(
      z.object({
        data: z.string(), // base64 encoded image
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Decode base64 to buffer
      const base64Data = input.data.split(",")[1] || input.data;
      const buffer = Buffer.from(base64Data, "base64");

      const key = `maestro-photos/${input.fileName}`;
      const { key: storedKey, url } = await storagePut(key, buffer, input.contentType);

      return { url, key: storedKey };
    }),

  /**
   * List all approved maestros for the public catalog.
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(maestros)
      .where(eq(maestros.verificationStatus, "approved"))
      .orderBy(sql`${maestros.points} DESC`);

    return rows.map((row) => ({
      ...row,
      slug: `${slugify(row.name)}-${row.id}`,
      profileUrl: `/maestro/${slugify(row.name)}-${row.id}`,
      galleryImages: row.galleryImages
        ? (row.galleryImages as { url: string; caption: string; key: string }[])
        : [],
    }));
  }),

  /**
   * Geocode a user's location and return lat/lng.
   * Used by the frontend to get coordinates for radius filtering.
   */
  geocode: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
      })
    )
    .query(async ({ input }) => {
      const coords = await geocodeLocation(input.query);
      return coords;
    }),

  /**
   * Search maestros within a radius of given coordinates.
   * Returns results sorted by distance (nearest first) with distance_km included.
   */
  searchByRadius: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radiusKm: z.number().min(1).max(200).default(10),
        trade: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [
        eq(maestros.verificationStatus, "approved"),
      ];

      if (input.trade && input.trade !== "Todos") {
        conditions.push(eq(maestros.trade, input.trade));
      }

      const rows = await db
        .select()
        .from(maestros)
        .where(and(...conditions));

      // Filter by radius using Haversine and enrich with distance
      const results = rows
        .filter((row) => row.latitude != null && row.longitude != null)
        .map((row) => ({
          ...row,
          slug: `${slugify(row.name)}-${row.id}`,
          profileUrl: `/maestro/${slugify(row.name)}-${row.id}`,
          galleryImages: row.galleryImages
            ? (row.galleryImages as { url: string; caption: string; key: string }[])
            : [],
          distanceKm: haversineKm(
            input.lat, input.lng,
            row.latitude!, row.longitude!
          ),
        }))
        .filter((row) => row.distanceKm <= input.radiusKm)
        .sort((a, b) => {
          if (b.points !== a.points) {
            return b.points - a.points;
          }
          return a.distanceKm - b.distanceKm;
        });

      return results;
    }),

  // ── Admin Procedures ──

  /**
   * List all maestros regardless of status (admin only).
   */
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(maestros)
      .orderBy(maestros.createdAt);

    return rows.map((row) => ({
      ...row,
      slug: `${slugify(row.name)}-${row.id}`,
      profileUrl: `/maestro/${slugify(row.name)}-${row.id}`,
      galleryImages: row.galleryImages
        ? (row.galleryImages as { url: string; caption: string; key: string }[])
        : [],
    }));
  }),

  /**
   * List only pending maestros for admin review queue.
   */
  listPending: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(maestros)
      .where(eq(maestros.verificationStatus, "pending"))
      .orderBy(maestros.createdAt);

    return rows.map((row) => ({
      ...row,
      slug: `${slugify(row.name)}-${row.id}`,
      profileUrl: `/maestro/${slugify(row.name)}-${row.id}`,
      galleryImages: row.galleryImages
        ? (row.galleryImages as { url: string; caption: string; key: string }[])
        : [],
    }));
  }),

  /**
   * Approve a pending maestro registration.
   * Returns NOT_FOUND if the maestro doesn't exist, and FORBIDDEN if already reviewed.
   */
  approve: adminProcedure
    .input(
      z.object({
        id: z.number().int().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check that the maestro exists and is still pending
      const existing = await db
        .select()
        .from(maestros)
        .where(eq(maestros.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Maestro not found" });
      }
      if (existing[0].verificationStatus !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot approve: status is already "${existing[0].verificationStatus}"`,
        });
      }

      await db
        .update(maestros)
        .set({ verificationStatus: "approved" })
        .where(eq(maestros.id, input.id));

      return { success: true, id: input.id, status: "approved" };
    }),

  /**
   * Reject a pending maestro registration.
   * Returns NOT_FOUND if the maestro doesn't exist, and FORBIDDEN if already reviewed.
   */
  reject: adminProcedure
    .input(
      z.object({
        id: z.number().int().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check that the maestro exists and is still pending
      const existing = await db
        .select()
        .from(maestros)
        .where(eq(maestros.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Maestro not found" });
      }
      if (existing[0].verificationStatus !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reject: status is already "${existing[0].verificationStatus}"`,
        });
      }

      await db
        .update(maestros)
        .set({ verificationStatus: "rejected" })
        .where(eq(maestros.id, input.id));

      return { success: true, id: input.id, status: "rejected" };
    }),

  /**
   * Get review stats: counts by status.
   */
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, approved: 0, rejected: 0, total: 0 };

    const rows = await db.select().from(maestros);
    const pending = rows.filter((r) => r.verificationStatus === "pending").length;
    const approved = rows.filter((r) => r.verificationStatus === "approved").length;
    const rejected = rows.filter((r) => r.verificationStatus === "rejected").length;

    return {
      pending,
      approved,
      rejected,
      total: rows.length,
    };
  }),

  /**
   * Get the logged-in user's maestro profile
   */
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(maestros)
      .where(eq(maestros.userId, ctx.user.id))
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0];
  }),

  /**
   * Update a maestro's profile. Requires ownership.
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.number().int().min(1),
        bio: z.string().optional(),
        skills: z.array(z.string()).optional(),
        avatarUrl: z.string().optional(),
        galleryImages: z
          .array(
            z.object({
              url: z.string(),
              caption: z.string().max(200),
              key: z.string(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(maestros)
        .where(eq(maestros.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Maestro not found" });
      }

      if (existing[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own profile" });
      }

      // Gamification Point Engine: +5 points for profile updates to prevent decay
      const newPoints = (existing[0].points || 0) + 5;

      await db
        .update(maestros)
        .set({
          bio: input.bio,
          skills: input.skills,
          avatarUrl: input.avatarUrl,
          galleryImages: input.galleryImages,
          points: newPoints,
        })
        .where(eq(maestros.id, input.id));

      return { success: true, points: newPoints };
    }),
});

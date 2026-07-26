import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { maestros, type InsertMaestro } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { publicProcedure, router } from "../_core/trpc";

export const maestrosRouter = router({
  /**
   * Register a new maestro with their details and optional gallery photos.
   * Photos are uploaded to S3 and stored as JSON array of { url, caption, key }.
   */
  register: publicProcedure
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
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const insertData: InsertMaestro = {
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
        verificationStatus: "approved",
      };

      const result = await db.insert(maestros).values(insertData);

      return {
        id: result[0].insertId,
        success: true,
        message: "Registro completado exitosamente",
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
      .where(eq(maestros.verificationStatus, "approved"));

    return rows.map((row) => ({
      ...row,
      galleryImages: row.galleryImages
        ? (row.galleryImages as { url: string; caption: string; key: string }[])
        : [],
    }));
  }),
});

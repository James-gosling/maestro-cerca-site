import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Mock context with no authenticated user (public endpoints).
 * The maestros router uses publicProcedure, so no auth is needed.
 */
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

/**
 * Minimal valid base64-encoded JPEG (1x1 pixel).
 * The upload endpoint expects base64 data that can be decoded to a buffer.
 */
const VALID_BASE64_JPEG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsLDA0QMDAxKjwvNTIwNTU5NDw6Ozs6Ojs7Oz8/3sA2Nz87PDw9QDw1ODQ4NTwwOzs3NTU7Oz87/3sAQDAwNDAwODA6ODU4NjQ1NTY1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU7/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGR4JSAoKjQ02NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKK//Z";

describe("maestros router", () => {
  describe("uploadPhoto", () => {
    it("uploads a photo and returns URL + key", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.uploadPhoto({
        data: VALID_BASE64_JPEG,
        fileName: "test_upload.jpg",
        contentType: "image/jpeg",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(result.url).toContain("/manus-storage/maestro-photos/");
      expect(result.key).toContain("maestro-photos/");
      expect(result.key).toContain("test_upload");
    });

    it("handles empty data field gracefully (creates file with minimal content)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Empty data with a valid fileName still creates a file (empty buffer)
      const result = await caller.maestros.uploadPhoto({
        data: "data:image/jpeg;base64,",
        fileName: "empty.jpg",
        contentType: "image/jpeg",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
    });

    it("handles empty fileName gracefully (creates file with auto-generated name)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.uploadPhoto({
        data: VALID_BASE64_JPEG,
        fileName: "",
        contentType: "image/jpeg",
      });

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(result.key).toContain("maestro-photos/");
    });
  });

  describe("register", () => {
    it("registers a maestro and returns success with ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // First upload a photo
      const uploadResult = await caller.maestros.uploadPhoto({
        data: VALID_BASE64_JPEG,
        fileName: "register_test.jpg",
        contentType: "image/jpeg",
      });

      const result = await caller.maestros.register({
        name: "Test Maestro",
        phone: "5512345678",
        trade: "Plomero",
        experience: 5,
        workType: "independiente",
        zone: "Coyoacán",
        galleryImages: [
          {
            url: uploadResult.url,
            caption: "Prueba de registro",
            key: uploadResult.key,
          },
        ],
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBeGreaterThan(0);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Registro completado exitosamente");
    });

    it("rejects registration with missing required fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.maestros.register({
          name: "",
          phone: "5512345678",
          trade: "Plomero",
          experience: 5,
          workType: "independiente",
          zone: "Coyoacán",
        })
      ).rejects.toThrow();
    });

    it("rejects registration with invalid workType", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.maestros.register({
          name: "Test",
          phone: "5512345678",
          trade: "Plomero",
          experience: 5,
          workType: "invalid_type" as "independiente" | "empresa",
          zone: "Coyoacán",
        })
      ).rejects.toThrow();
    });

    it("registers without gallery images (optional)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.register({
        name: "No Photo Maestro",
        phone: "5598765432",
        trade: "Electricista",
        experience: 3,
        workType: "empresa",
        zone: "Iztapalapa",
      });

      expect(result).toHaveProperty("id");
      expect(result.success).toBe(true);
    });
  });

  describe("list", () => {
    it("returns an array of approved maestros", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

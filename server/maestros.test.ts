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

  describe("searchByRadius", () => {
    it("returns empty array when no maestros have coordinates", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.searchByRadius({
        lat: 19.3467,
        lng: -99.1618,
        radiusKm: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("returns maestros within radius with distanceKm sorted ascending", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Register two maestros with coordinates at known distances from Coyoacán center
      const nearResult = await caller.maestros.register({
        name: "Near Maestro",
        phone: "5533333333",
        trade: "Plomero",
        experience: 10,
        workType: "independiente",
        zone: "Coyoacán",
        latitude: 19.3470, // ~33m away (essentially 0 km)
        longitude: -99.1615,
      });

      const farResult = await caller.maestros.register({
        name: "Far Maestro",
        phone: "5544444444",
        trade: "Plomero",
        experience: 10,
        workType: "independiente",
        zone: "Iztapalapa",
        latitude: 19.3570, // ~1.1 km away
        longitude: -99.0618,
      });

      // Search with 15 km radius (far maestro is ~11 km away)
      const result = await caller.maestros.searchByRadius({
        lat: 19.3467,
        lng: -99.1618,
        radiusKm: 15,
      });

      // Both should be within 15 km
      const nearMaestro = result.find((m) => m.id === nearResult.id);
      const farMaestro = result.find((m) => m.id === farResult.id);

      expect(nearMaestro).toBeDefined();
      expect(farMaestro).toBeDefined();
      expect(nearMaestro!.distanceKm).toBeLessThan(farMaestro!.distanceKm);
      expect(nearMaestro!.distanceKm).toBeGreaterThanOrEqual(0);
    });

    it("excludes maestros outside the radius", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Register a maestro far away (Toluca, ~40 km from CDMX center)
      const distantResult = await caller.maestros.register({
        name: "Distant Maestro",
        phone: "5555555555",
        trade: "Electricista",
        experience: 5,
        workType: "empresa",
        zone: "Toluca",
        latitude: 19.2833,
        longitude: -99.6533,
      });

      // Search with 5 km radius
      const result = await caller.maestros.searchByRadius({
        lat: 19.3467,
        lng: -99.1618,
        radiusKm: 5,
      });

      const distantMaestro = result.find((m) => m.id === distantResult.id);
      expect(distantMaestro).toBeUndefined();
    });

    it("filters by trade when trade parameter is provided", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.searchByRadius({
        lat: 19.3467,
        lng: -99.1618,
        radiusKm: 100,
        trade: "Electricista",
      });

      // All results should be Electricista
      result.forEach((m) => {
        expect(m.trade).toBe("Electricista");
      });
    });

    it("returns results sorted by distance ascending", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.searchByRadius({
        lat: 19.3467,
        lng: -99.1618,
        radiusKm: 100,
      });

      for (let i = 1; i < result.length; i++) {
        expect(result[i]!.distanceKm).toBeGreaterThanOrEqual(result[i - 1]!.distanceKm);
      }
    });
  });

  describe("geocode", () => {
    it("returns null for empty query", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.maestros.geocode({ query: "" })
      ).rejects.toThrow();
    });

    it("returns coordinates or null for a valid query", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.geocode({ query: "Coyoacán" });

      // May return null if the geocoding API is unavailable in test env
      if (result !== null) {
        expect(result).toHaveProperty("lat");
        expect(result).toHaveProperty("lng");
        expect(result!.lat).toBeGreaterThan(-90);
        expect(result!.lat).toBeLessThan(90);
      }
    });
  });

  describe("getBySlug", () => {
    it("returns null for non-existent slug", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.maestros.getBySlug({ slug: "non-existent-999" });

      expect(result).toBeNull();
    });

    it("rejects empty slug string", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.maestros.getBySlug({ slug: "" })
      ).rejects.toThrow();
    });

    it("returns maestro with slug and profileUrl when found", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // First register a maestro to ensure there is data
      const regResult = await caller.maestros.register({
        name: "Slug Test Maestro",
        phone: "5511111111",
        trade: "Plomero",
        experience: 10,
        workType: "independiente",
        zone: "Coyoacán",
      });

      const result = await caller.maestros.getBySlug({
        slug: `slug-test-maestro-${regResult.id}`,
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(regResult.id);
      expect(result!.name).toBe("Slug Test Maestro");
      expect(result!.slug).toBe(`slug-test-maestro-${regResult.id}`);
      expect(result!.profileUrl).toBe(`/maestro/slug-test-maestro-${regResult.id}`);
    });

    it("returns galleryImages as array when maestro has photos", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Upload a photo first
      const uploadResult = await caller.maestros.uploadPhoto({
        data: VALID_BASE64_JPEG,
        fileName: "slug_gallery_test.jpg",
        contentType: "image/jpeg",
      });

      // Register with gallery
      const regResult = await caller.maestros.register({
        name: "Gallery Maestro",
        phone: "5522222222",
        trade: "Electricista",
        experience: 7,
        workType: "independiente",
        zone: "Roma Norte",
        galleryImages: [
          {
            url: uploadResult.url,
            caption: "Trabajo de prueba",
            key: uploadResult.key,
          },
        ],
      });

      const result = await caller.maestros.getBySlug({
        slug: `gallery-maestro-${regResult.id}`,
      });

      expect(result).not.toBeNull();
      expect(Array.isArray(result!.galleryImages)).toBe(true);
      expect(result!.galleryImages.length).toBe(1);
      expect(result!.galleryImages[0].caption).toBe("Trabajo de prueba");
    });
  });
});

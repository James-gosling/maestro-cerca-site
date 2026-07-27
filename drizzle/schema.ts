import { double, float, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Maestros (workers) table — stores registration data from the onboarding wizard.
 * galleryImages is stored as JSON array of { url: string; caption: string; key: string }.
 */
export const maestros = mysqlTable("maestros", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  trade: text("trade").notNull(),
  experience: int("experience").default(0),
  workType: mysqlEnum("workType", ["independiente", "empresa"]).default("independiente"),
  zone: text("zone").notNull(),
  /** JSON array of { url: string; caption: string; key: string } */
  galleryImages: json("galleryImages"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending"),
  idDocumentKey: text("idDocumentKey"),
  /** Latitude for geolocation radius search */
  latitude: float("latitude"),
  /** Longitude for geolocation radius search */
  longitude: float("longitude"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Maestro = typeof maestros.$inferSelect;
export type InsertMaestro = typeof maestros.$inferInsert;

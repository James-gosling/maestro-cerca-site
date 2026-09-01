import { double, float, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
  /** Client loyalty program — points earned by clients for activity */
  clientPoints: int("clientPoints").default(0).notNull(),
  /** Client loyalty tier based on points balance */
  clientTier: mysqlEnum("clientTier", ["Bronce", "Plata", "Oro"]).default("Bronce").notNull(),
  /** Whether this user is a "Cliente Fundador" (registered during beta/launch) */
  isFounder: int("isFounder").default(0).notNull(),
  /** Whether an administrator wants registration alerts by email; web alerts remain active. */
  adminRegistrationEmailEnabled: int("adminRegistrationEmailEnabled").default(1).notNull(),
  /** Whether the user wants activity alerts shown in the in-app notification center. */
  webNotificationsEnabled: int("webNotificationsEnabled").default(1).notNull(),
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
  userId: int("userId").references(() => users.id),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  trade: text("trade").notNull(),
  experience: int("experience").default(0),
  workType: mysqlEnum("workType", ["independiente", "empresa"]).default("independiente"),
  zone: text("zone").notNull(),
  bio: text("bio"),
  skills: json("skills"),
  avatarUrl: text("avatarUrl"),
  points: int("points").default(0).notNull(),
  referencesCount: int("referencesCount").default(0).notNull(),
  reviewsCount: int("reviewsCount").default(0).notNull(),
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
}, (table) => ({
  phoneUniqueIdx: uniqueIndex("maestros_phone_unique_idx").on(table.phone),
  pointsIdx: index("maestros_points_idx").on(table.points),
  verificationStatusIdx: index("maestros_verificationStatus_idx").on(table.verificationStatus),
}));

export type Maestro = typeof maestros.$inferSelect;
export type InsertMaestro = typeof maestros.$inferInsert;

/**
 * Contact unlocks — tracks which users have unlocked a maestro's contact info
 * via Stripe payment. Only essential Stripe IDs stored per the integration guide.
 */
export const contactUnlocks = mysqlTable("contact_unlocks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  maestroId: int("maestroId").notNull(),
  maestroName: text("maestroName"),
  maestroTrade: text("maestroTrade"),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amount: int("amount").notNull(), // amount in cents
  currency: varchar("currency", { length: 3 }).default("mxn").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactUnlock = typeof contactUnlocks.$inferSelect;
export type InsertContactUnlock = typeof contactUnlocks.$inferInsert;

/**
 * Reviews table — stores client reviews and ratings for maestros.
 * Feeds the 3-tier gamification system (reviewsCount + points).
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  maestroId: int("maestroId").notNull(),
  userId: int("userId").notNull(),
  authorName: varchar("authorName", { length: 120 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Notifications table — stores in-app notifications for workers.
 * Admin alerts are sent via notifyOwner(); worker notifications persist here.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["registration_pending", "registration_approved", "registration_rejected", "review_received", "payment_completed", "admin_registration_pending"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  read: int("read").default(0).notNull(),
  maestroId: int("maestroId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Inquiries table — stores pre-unlock availability requests from clients.
 * Clients can send a free message to a maestro before paying for contact unlock.
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  maestroId: int("maestroId").notNull(),
  senderName: varchar("senderName", { length: 120 }).notNull(),
  senderPhoneOrEmail: varchar("senderPhoneOrEmail", { length: 200 }),
  clientEmail: varchar("clientEmail", { length: 200 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["unread", "replied"]).default("unread").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  maestroIdIdx: index("inquiries_maestroId_idx").on(table.maestroId),
  statusIdx: index("inquiries_status_idx").on(table.status),
}));

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Point transactions log — tracks all point awards and redemptions for clients.
 * Enables audit trail and balance reconciliation.
 */
export const pointTransactions = mysqlTable("point_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // positive = earned, negative = redeemed
  reason: mysqlEnum("reason", [
    "review_submitted",
    "contact_unlocked",
    "beta_feedback",
    "free_unlock_redeemed",
  ]).notNull(),
  maestroId: int("maestroId"), // optional: link to the relevant maestro
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("point_transactions_userId_idx").on(table.userId),
  createdAtIdx: index("point_transactions_createdAt_idx").on(table.createdAt),
}));

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

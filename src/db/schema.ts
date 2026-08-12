import { relations } from "drizzle-orm/_relations";
import { pgTable, text, integer, bigint, timestamp, uuid, boolean } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),

  googleId: text("google_id").unique(),

  name: text("name"),
  picture: text("picture"),
  verifiedEmail: boolean("verified_email"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userCredentials = pgTable("user_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  refreshTokenExpiresIn: integer("refresh_token_expires_in").notNull(),
  expiryDate: bigint("expiry_date", { mode: "number" }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const gmailData = pgTable("gmail_data", {
  id: text("id").primaryKey(),
  threadId: text("thread_id"),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  snippet: text("snippet").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  date: text("date").notNull(),
  body: text("body").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(userCredentials),
  emails: many(gmailData),
}));

export const userCredentialsRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, { fields: [userCredentials.userId], references: [users.id] }),
}));

export const gmailDataRelations = relations(gmailData, ({ one }) => ({
  user: one(users, { fields: [gmailData.userId], references: [users.id] }),
}));

import { relations } from "drizzle-orm/_relations";
import { pgTable, text, integer, bigint, timestamp, uuid, boolean, pgEnum, json } from "drizzle-orm/pg-core";


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
  id: text("id").primaryKey().unique().notNull(),
  threadId: text("thread_id"),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  snippet: text("snippet").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  body: text("body").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const statisticsResultsEnum = pgEnum(
  "statistics_results_enum",
  [
    "Pending",
    "Completed",
    "Failed"
  ]
);

export const statisticsResults = pgTable("statistics_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: statisticsResultsEnum("status").default("Pending").notNull(),
  data: json("data"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(userCredentials),
  emails: many(gmailData),
  statisticsResults: many(statisticsResults)
}));

export const userCredentialsRelations = relations(userCredentials, ({ one }) => ({
  user: one(users, { fields: [userCredentials.userId], references: [users.id] }),
}));

export const gmailDataRelations = relations(gmailData, ({ one }) => ({
  user: one(users, { fields: [gmailData.userId], references: [users.id] }),
}));

export const statisticsResultsRelations = relations(statisticsResults, ({ one }) => ({
  user: one(users, { fields: [statisticsResults.userId], references: [users.id] }),
}));

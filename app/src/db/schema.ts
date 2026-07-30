import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, index, pgEnum } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("citizen").notNull(),
  nationalID: text("national_id"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// --- Enums (FR3, FR7.2) ---

export const documentTypeEnum = pgEnum("document_type", [
  "national_id",
  "birth_certificate",
]);

export const statusEnum = pgEnum("status", [
  "submitted",
  "under_review",
  "missing_information",
  "ready_for_registry_visit",
  "closed",
]);

// --- Intake records (FR5) ---

export const intakeRecords = pgTable(
  "intake_records",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    referenceNumber: text("reference_number").notNull().unique(), // FR7.1
    documentType: documentTypeEnum("document_type").notNull(),
    status: statusEnum("status").default("submitted").notNull(),

    fullName: text("full_name").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    gender: text("gender").notNull(),
    placeOfOrigin: text("place_of_origin").notNull(),

    // Two-digit Zimbabwe registry district code (e.g. "63" for Harare), which
    // forms the prefix of a National ID. Nullable: records submitted before
    // this column existed have no value, and the client may omit it.
    districtCode: text("district_code"),

    details: text("details"), 

    submittedByUserId: text("submitted_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isAdminAssisted: boolean("is_admin_assisted").default(false).notNull(), 

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("intake_records_userId_idx").on(table.submittedByUserId)],
);

// --- Document checklist  ---

export const checklistItems = pgTable(
  "checklist_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    intakeRecordId: integer("intake_record_id")
      .notNull()
      .references(() => intakeRecords.id, { onDelete: "cascade" }),
    itemLabel: text("item_label").notNull(), // e.g. "Parent's National ID"
    isAvailable: boolean("is_available").default(false).notNull(),
  },
  (table) => [index("checklist_items_recordId_idx").on(table.intakeRecordId)],
);


export const statusLogs = pgTable(
  "status_logs",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    intakeRecordId: integer("intake_record_id")
      .notNull()
      .references(() => intakeRecords.id, { onDelete: "cascade" }),
    changedByUserId: text("changed_by_user_id")
      .notNull()
      .references(() => user.id),
    previousStatus: statusEnum("previous_status"),
    newStatus: statusEnum("new_status").notNull(),
    comment: text("comment"), // admin guidance, e.g. "missing parent's ID"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("status_logs_recordId_idx").on(table.intakeRecordId)],
);

// --- Relations ---

export const intakeRecordsRelations = relations(intakeRecords, ({ one, many }) => ({
  submittedBy: one(user, {
    fields: [intakeRecords.submittedByUserId],
    references: [user.id],
  }),
  checklistItems: many(checklistItems),
  statusLogs: many(statusLogs),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  intakeRecord: one(intakeRecords, {
    fields: [checklistItems.intakeRecordId],
    references: [intakeRecords.id],
  }),
}));

export const statusLogsRelations = relations(statusLogs, ({ one }) => ({
  intakeRecord: one(intakeRecords, {
    fields: [statusLogs.intakeRecordId],
    references: [intakeRecords.id],
  }),
  changedBy: one(user, {
    fields: [statusLogs.changedByUserId],
    references: [user.id],
  }),
}));

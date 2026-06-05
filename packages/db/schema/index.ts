import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const apiScopes = [
  "read:verdicts",
  "write:disputes",
  "read:credentials",
  "write:webhooks"
] as const;

export type ApiScope = (typeof apiScopes)[number];

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletAddress: text("wallet_address"),
    email: text("email"),
    authProvider: text("auth_provider").notNull().default("wallet"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    walletIdx: uniqueIndex("users_wallet_address_idx").on(table.walletAddress),
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export const disputes = pgTable(
  "disputes",
  {
    id: text("id").primaryKey(),
    escrowAddress: text("escrow_address").notNull(),
    claimant: text("claimant").notNull(),
    respondent: text("respondent").notNull(),
    claimantCid: text("claimant_cid").notNull(),
    respondentCid: text("respondent_cid"),
    scopeDocHash: text("scope_doc_hash"),
    status: text("status").notNull().default("pending_response"),
    stakeGen: numeric("stake_gen", { precision: 38, scale: 18 }).notNull().default("0"),
    onChainDisputeId: text("on_chain_dispute_id"),
    onChainTx: text("on_chain_tx"),
    appealWindowExpires: timestamp("appeal_window_expires", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    claimantIdx: index("disputes_claimant_idx").on(table.claimant),
    respondentIdx: index("disputes_respondent_idx").on(table.respondent),
    statusIdx: index("disputes_status_idx").on(table.status)
  })
);

export const verdicts = pgTable(
  "verdicts",
  {
    id: text("id").primaryKey(),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    winner: text("winner").notNull(),
    splitRatio: numeric("split_ratio", { precision: 5, scale: 4 }),
    confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
    reasoning: text("reasoning").notNull(),
    reasoningTrace: jsonb("reasoning_trace")
      .$type<Array<{ label: string; match: number; detail: string }>>()
      .notNull()
      .default([]),
    claimantWeight: numeric("claimant_weight", { precision: 5, scale: 4 }).notNull(),
    respondentWeight: numeric("respondent_weight", { precision: 5, scale: 4 }).notNull(),
    evidenceWeights: jsonb("evidence_weights")
      .$type<Array<{ source: string; side: "claimant" | "respondent"; weight: number; confidence: string }>>()
      .notNull()
      .default([]),
    onChainTx: text("on_chain_tx"),
    committedAt: timestamp("committed_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    disputeIdx: uniqueIndex("verdicts_dispute_id_idx").on(table.disputeId)
  })
);

export const appeals = pgTable(
  "appeals",
  {
    id: text("id").primaryKey(),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    appellant: text("appellant").notNull(),
    stakeGen: numeric("stake_gen", { precision: 38, scale: 18 }).notNull(),
    appealCid: text("appeal_cid").notNull(),
    status: text("status").notNull().default("pending"),
    finalVerdictId: text("final_verdict_id").references(() => verdicts.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    disputeIdx: index("appeals_dispute_id_idx").on(table.disputeId),
    appellantIdx: index("appeals_appellant_idx").on(table.appellant)
  })
);

export const credentials = pgTable(
  "credentials",
  {
    id: text("id").primaryKey(),
    disputeId: text("dispute_id")
      .notNull()
      .references(() => disputes.id, { onDelete: "cascade" }),
    walletAddress: text("wallet_address").notNull(),
    tokenId: text("token_id").notNull(),
    metadataHash: text("metadata_hash").notNull(),
    onChainTx: text("on_chain_tx"),
    mintedAt: timestamp("minted_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    walletIdx: index("credentials_wallet_address_idx").on(table.walletAddress),
    tokenIdx: uniqueIndex("credentials_token_id_idx").on(table.tokenId)
  })
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    keyHash: text("key_hash").notNull(),
    prefix: text("prefix").notNull().default("dk"),
    scopes: jsonb("scopes").$type<ApiScope[]>().notNull().default([]),
    label: text("label").notNull(),
    lastUsed: timestamp("last_used", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true })
  },
  (table) => ({
    keyHashIdx: uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
    userIdx: index("api_keys_user_id_idx").on(table.userId)
  })
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    secret: text("secret").notNull(),
    events: jsonb("events").$type<Array<"verdict.delivered">>().notNull().default(["verdict.delivered"]),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    userIdx: index("webhooks_user_id_idx").on(table.userId)
  })
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookId: uuid("webhook_id")
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    nextRetry: timestamp("next_retry", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    retryIdx: index("webhook_deliveries_retry_idx").on(table.status, table.nextRetry)
  })
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    actorIdx: index("audit_log_actor_id_idx").on(table.actorId),
    resourceIdx: index("audit_log_resource_idx").on(table.resourceType, table.resourceId)
  })
);

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    disputeId: text("dispute_id").references(() => disputes.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    statusIdx: index("jobs_status_idx").on(table.status),
    disputeIdx: index("jobs_dispute_id_idx").on(table.disputeId)
  })
);

export type User = typeof users.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
export type Verdict = typeof verdicts.$inferSelect;
export type Appeal = typeof appeals.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

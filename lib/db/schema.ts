import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  pgEnum,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';

// Enums
export const modelTypeEnum = pgEnum("model_type", [
  "text-large",
  "text-small", 
  "reasoning",
  "image",
  "search"
]);

export const visibilityEnum = pgEnum("visibility", ["public", "private", "link"]);
export type AgentVisibility = typeof visibilityEnum.enumValues[number];

// Base tables (no foreign key dependencies)
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  user_name: varchar('user_name', { length: 64 }),
  credit_balance: numeric('credit_balance', { precision: 19, scale: 9 }).default('0'),
  lifetime_credits: numeric('lifetime_credits', { precision: 19, scale: 9 }).default('0'),
});

export type User = InferSelectModel<typeof user>;

export const models = pgTable("models", {
  id: uuid("id").defaultRandom().primaryKey(),
  model_display_name: varchar("model_display_name", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  model_type: modelTypeEnum("model_type").default("text-small"),
  description: text("description"),
  cost_per_million_input_tokens: numeric("cost_per_million_input_tokens", { precision: 10, scale: 4 }),
  cost_per_million_output_tokens: numeric("cost_per_million_output_tokens", { precision: 10, scale: 4 }),
  provider_options: json("provider_options"), 
});

export type Model = typeof models.$inferSelect;

// Tool Groups table
export const toolGroups = pgTable("tool_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  display_name: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: uuid("creator_id").references(() => user.id),
});

export type ToolGroup = typeof toolGroups.$inferSelect;

// First level of dependencies (only depend on base tables)
export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  agent: varchar("agent", { length: 255 }).notNull().unique().default("temp_slug"),
  agent_display_name: varchar("agent_display_name", { length: 255 }).notNull(),
  system_prompt: text("system_prompt").notNull(),
  description: text("description"),
  visibility: visibilityEnum("visibility").default("public"),
  creatorId: uuid("creator_id").references(() => user.id),
  artifacts_enabled: boolean("artifacts_enabled").default(true),
  image_url: text("image_url"),
});
 
export type Agent = typeof agents.$inferSelect;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

// Second level of dependencies
export const agentModels = pgTable("agent_models", {
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  modelId: uuid("model_id")
    .notNull()
    .references(() => models.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.agentId, table.modelId] }),
  };
});

export type AgentModel = typeof agentModels.$inferSelect;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  agentId: uuid('agentId')
    .references(() => agents.id, { onDelete: 'cascade' }),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export type ExtendedChat = Chat & {
  agentDisplayName?: string | null;
};

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

// Third level of dependencies
export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  token_usage: integer('token_usage'),
  model_id: uuid("model_id")
    .references(() => models.id, { onDelete: "cascade" }),
});

export type Message = InferSelectModel<typeof message>;

// Fourth level of dependencies
export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id, { onDelete: 'cascade' }),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id, { onDelete: 'cascade' }),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  tool_display_name: varchar("tool_display_name", { length: 255 }).notNull(),
  tool: varchar("tool", { length: 255 }).notNull().unique(),
  description: text("description"),
  parameter_schema: json("parameter_schema"), // Stores the Zod/JSON schema for tool parameters
  config: json("config"), 
});

export type Tool = typeof tools.$inferSelect;

// Many-to-many relationship between tools and tool groups
export const toolGroupTools = pgTable("tool_group_tools", {
  toolGroupId: uuid("tool_group_id")
    .notNull()
    .references(() => toolGroups.id, { onDelete: "cascade" }),
  toolId: uuid("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.toolGroupId, table.toolId] }),
  };
});

export type ToolGroupTool = typeof toolGroupTools.$inferSelect;

// Many-to-many relationship between agents and tool groups
export const agentToolGroups = pgTable("agent_tool_groups", {
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  toolGroupId: uuid("tool_group_id")
    .notNull()
    .references(() => toolGroups.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.agentId, table.toolGroupId] }),
  };
});

export type AgentToolGroup = typeof agentToolGroups.$inferSelect;



// Enum for transaction types
export const transactionTypeEnum = pgEnum("transaction_type", [
  "usage",
  "purchase",
  "refund",
  "promotional",
  "adjustment"
]);

export const userTransactions = pgTable('user_transactions', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  amount: numeric('amount', { precision: 19, scale: 9 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  description: text('description'),
  messageId: uuid('message_id').references(() => message.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export type UserTransaction = InferSelectModel<typeof userTransactions>;

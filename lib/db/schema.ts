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
  index,
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
}, (table) => {
  return {
    emailIdx: index("user_email_idx").on(table.email),
  };
});

export type User = InferSelectModel<typeof user>;

// Add new user_credits table
export const userCredits = pgTable('user_credits', {
  user_id: uuid('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  credit_balance: numeric('credit_balance', { precision: 19, scale: 9 }).default('0'),
  lifetime_credits: numeric('lifetime_credits', { precision: 19, scale: 9 }).default('0'),
});

export type UserCredits = InferSelectModel<typeof userCredits>;

// Customer table for Stripe integration
export const customer = pgTable('customer', {
  id: uuid('id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  stripe_customer_id: varchar('stripe_customer_id', { length: 100 }),
  email: varchar('email', { length: 64 }),
});

export type Customer = InferSelectModel<typeof customer>;

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
}, (table) => {
  return {
    modelIdx: index("model_idx").on(table.model),
    providerIdx: index("provider_idx").on(table.provider),
  };
});

export type Model = typeof models.$inferSelect;

// Tool Groups table
export const toolGroups = pgTable("tool_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  display_name: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: uuid("creator_id").references(() => user.id),
}, (table) => {
  return {
    creatorIdIdx: index("tool_groups_creator_id_idx").on(table.creatorId),
  };
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
  customization: json("customization").default({
    overview: {
      title: "Welcome to your AI assistant!",
      content: "Im here to help answer your questions and provide information. Feel free to ask me anything.",
      showPoints: false,
      points: []
    },
    style: {
      colorSchemeId: "default",
      // backgroundColor: "#ffffff",
      // customColors: false
    }
  }),
}, (table) => {
  return {
    creatorIdIdx: index("agents_creator_id_idx").on(table.creatorId),
    visibilityIdx: index("agents_visibility_idx").on(table.visibility),
  };
});
 
export type Agent = typeof agents.$inferSelect;

export interface AgentCustomization {
  overview: {
    title: string;
    content: string;
    showPoints: boolean;
    points: string[];
  };
  style: {
    colorSchemeId: string;
  };
}

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
      userIdIdx: index("document_user_id_idx").on(table.userId),
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
    agentIdIdx: index("agent_models_agent_id_idx").on(table.agentId),
    modelIdIdx: index("agent_models_model_id_idx").on(table.modelId),
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
}, (table) => {
  return {
    userIdIdx: index("chat_user_id_idx").on(table.userId),
    agentIdIdx: index("chat_agent_id_idx").on(table.agentId),
    createdAtIdx: index("chat_created_at_idx").on(table.createdAt),
  };
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
    documentIdIdx: index("suggestion_document_id_idx").on(table.documentId, table.documentCreatedAt),
    userIdIdx: index("suggestion_user_id_idx").on(table.userId),
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
  model_id: uuid("model_id")
    .references(() => models.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    chatIdIdx: index("message_chat_id_idx").on(table.chatId),
    modelIdIdx: index("message_model_id_idx").on(table.model_id),
    createdAtIdx: index("message_created_at_idx").on(table.createdAt),
  };
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
      chatIdIdx: index("vote_chat_id_idx").on(table.chatId),
      messageIdIdx: index("vote_message_id_idx").on(table.messageId),
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
    toolGroupIdIdx: index("tool_group_tools_tool_group_id_idx").on(table.toolGroupId),
    toolIdIdx: index("tool_group_tools_tool_id_idx").on(table.toolId),
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
    agentIdIdx: index("agent_tool_groups_agent_id_idx").on(table.agentId),
    toolGroupIdIdx: index("agent_tool_groups_tool_group_id_idx").on(table.toolGroupId),
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

// Enum for token types
export const tokenTypeEnum = pgEnum("token_type", [
  "input",
  "output"
]);

export const userTransactions = pgTable('user_transactions', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id),
  amount: numeric('amount', { precision: 19, scale: 9 }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  description: text('description'),
  messageId: uuid('message_id').references(() => message.id, { onDelete: 'set null' }),
  modelId: uuid('model_id').references(() => models.id, { onDelete: 'set null' }),
  tokenAmount: integer('token_amount'),
  tokenType: tokenTypeEnum('token_type'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("user_transactions_user_id_idx").on(table.userId),
    messageIdIdx: index("user_transactions_message_id_idx").on(table.messageId),
  };
});

export type UserTransaction = InferSelectModel<typeof userTransactions>;

// Tags system - for categorizing and finding agents
export const tagCategories = pgTable('tag_categories', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TagCategory = typeof tagCategories.$inferSelect;

export const tagSourceEnum = pgEnum("tag_source", [
  "system",
  "user"
]);

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    nameIdx: index("tags_name_idx").on(table.name),
  };
});

export type Tag = typeof tags.$inferSelect;

export const agentTags = pgTable('agent_tags', {
  agentId: uuid('agent_id')
    .notNull()
    .references(() => agents.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.agentId, table.tagId] }),
    agentIdIdx: index("agent_tags_agent_id_idx").on(table.agentId),
    tagIdIdx: index("agent_tags_tag_id_idx").on(table.tagId),
  };
});

export type AgentTag = typeof agentTags.$inferSelect;

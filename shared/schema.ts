import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Block schema for blockchain
export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  blockNumber: integer("block_number").notNull(),
  hash: text("hash").notNull().unique(),
  previousHash: text("previous_hash").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  data: text("data").notNull(),
  nonce: integer("nonce").notNull(),
  transactionCount: integer("transaction_count").notNull(),
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
});

export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Block = typeof blocks.$inferSelect;

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  blockId: integer("block_id").notNull(),
  type: text("type").notNull(),
  entity: text("entity").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hash: text("hash").notNull().unique(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
  blockId: integer("block_id"),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  verified: true,
  createdAt: true,
  verifiedAt: true,
  blockId: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Budget schema
export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  allocated: numeric("allocated").notNull(),
  spent: numeric("spent").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
});

export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;

// Digital Identity schema
export const digitalIdentities = pgTable("digital_identities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  identifier: text("identifier").notNull().unique(),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
  blockNumber: integer("block_number").notNull(),
  transactionHash: text("transaction_hash").notNull(),
});

export const insertDigitalIdentitySchema = createInsertSchema(digitalIdentities).omit({
  id: true,
  active: true,
  createdAt: true,
  revokedAt: true,
  blockNumber: true,
  transactionHash: true,
});

export type InsertDigitalIdentity = z.infer<typeof insertDigitalIdentitySchema>;
export type DigitalIdentity = typeof digitalIdentities.$inferSelect;

// Stats interface for dashboard
export interface Stats {
  totalBlocks: number;
  dailyTransactions: number;
  verifiedDocuments: number;
  digitalIdentities: number;
}

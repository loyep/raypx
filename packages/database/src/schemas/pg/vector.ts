/**
 * Vector database schemas
 *
 * Uses pgvector extension for vector similarity search.
 * Make sure to enable pgvector in your PostgreSQL database:
 * CREATE EXTENSION IF NOT EXISTS vector;
 */

import { index, jsonb, text, uuid, vector } from "drizzle-orm/pg-core";
import { pgTable, timestamptz } from "../../utils";

/**
 * Vector embeddings table
 * Stores embeddings for vector similarity search
 */
export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chunkId: uuid("chunk_id").notNull(),
    embedding: vector("embedding", {
      dimensions: 1024, // Default dimension, can be adjusted per provider
    }),
    content: text("content"), // Cached content for faster retrieval
    metadata: jsonb("metadata"), // Additional metadata (document ID, etc.)
    model: text("model"), // Embedding model name
    userId: text("user_id").notNull(), // User ID for access control
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_embeddings_chunk_id").on(table.chunkId),
    index("idx_embeddings_user_id").on(table.userId),
    index("idx_embeddings_user_id_chunk_id").on(table.userId, table.chunkId),
    // Vector similarity index (using HNSW for better performance)
    // Note: This index is created manually via migration SQL, not via Drizzle
    // CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
  ],
);

/**
 * Vector chunks table
 * Stores text chunks with their embeddings
 */
export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text").notNull(),
    index: text("index_name").notNull(), // Chunk index
    userId: text("user_id").notNull(),
    metadata: jsonb("metadata"), // Chunk metadata (startIndex, endIndex, etc.)
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [index("idx_chunks_user_id").on(table.userId)],
);

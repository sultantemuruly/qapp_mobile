import { sql } from "drizzle-orm";
import {
    integer,
    jsonb,
    pgTable,
    serial,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";

/** One block on a page (stored only inside JSON, not as separate rows). */
export type BookPageElement =
  | { type: "chapter_name"; content: string }
  | { type: "text"; content: string }
  | { type: "quote"; content: string }
  | { type: "keywords"; content: string[] };

export type BookPage = {
  page_number: number;
  elements: BookPageElement[];
};

/** Full book document as stored in the `data` jsonb column. */
export type BookDocument = {
  book_id: string;
  title: string;
  author: string;
  language: string;
  genres: string[];
  /** Storage path within the Supabase bucket (not a full URL). */
  cover_image_path?: string;
  total_pages: number;
  pages: BookPage[];
};

/** Some rows store a single object; others wrap it in a one-element array. */
export type BookDataColumn = BookDocument | BookDocument[];

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const booksTable = pgTable(
  "books",
  {
    id: serial("id").primaryKey(),
    /** Entire book object as one JSON document (pages, elements, etc.). */
    data: jsonb("data").$type<BookDataColumn>().notNull(),
  },
  (table) => [
    uniqueIndex("books_book_id_unique").on(sql`(${table.data} ->> 'book_id')`),
  ],
);

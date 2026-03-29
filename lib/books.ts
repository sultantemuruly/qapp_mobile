import type { BookDataColumn, BookDocument, BookPage } from "@/db/schema";
import { supabase, supabaseCoverPublicUrl } from "@/lib/supabase";

export type BookRow = {
  id: number;
  data: BookDataColumn;
};

export type FetchBooksResult = {
  books: { id: number; document: BookDocument }[];
  /** How many table rows PostgREST returned (0 with no error often means RLS or an empty table). */
  tableRowCount: number;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function stringish(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim().length > 0) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}

function normalizePages(raw: unknown): BookPage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p, i) => {
    const pr = asRecord(p);
    if (!pr) {
      return { page_number: i + 1, elements: [] };
    }
    const page_number =
      typeof pr.page_number === "number"
        ? pr.page_number
        : typeof pr.pageNumber === "number"
          ? pr.pageNumber
          : i + 1;
    const elements = Array.isArray(pr.elements) ? pr.elements : [];
    return { page_number, elements: elements as BookPage["elements"] };
  });
}

function normalizeOneBook(obj: Record<string, unknown>): BookDocument | null {
  const book_id =
    stringish(obj.book_id) ??
    stringish(obj.bookId);
  if (!book_id) return null;

  const title = stringish(obj.title) ?? "Untitled";
  const pages = normalizePages(obj.pages);
  const author = typeof obj.author === "string" ? obj.author : "";
  const language = typeof obj.language === "string" ? obj.language : "";
  const genres = Array.isArray(obj.genres)
    ? obj.genres.filter((g): g is string => typeof g === "string")
    : [];

  const cover_image_path =
    typeof obj.cover_image_path === "string"
      ? obj.cover_image_path
      : typeof obj.coverImagePath === "string"
        ? obj.coverImagePath
        : undefined;

  const total_pages =
    typeof obj.total_pages === "number"
      ? obj.total_pages
      : typeof obj.totalPages === "number"
        ? obj.totalPages
        : Math.max(pages.length, 1);

  return {
    book_id,
    title,
    author,
    language,
    genres,
    cover_image_path,
    total_pages,
    pages,
  };
}

/**
 * One `data` cell may be a single book object, a one-element array (legacy), or multiple books in one array.
 */
export function normalizeBooksFromCell(raw: unknown): BookDocument[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    const out: BookDocument[] = [];
    for (const item of raw) {
      const rec = asRecord(item);
      if (!rec) continue;
      const looksLikeBook =
        rec.book_id != null ||
        rec.bookId != null ||
        (rec.title != null && rec.pages != null);
      if (!looksLikeBook) continue;
      const b = normalizeOneBook(rec);
      if (b) out.push(b);
    }
    return out;
  }

  const rec = asRecord(raw);
  if (!rec) return [];
  const b = normalizeOneBook(rec);
  return b ? [b] : [];
}

/** @deprecated Prefer normalizeBooksFromCell; returns first book only. */
export function normalizeBookPayload(raw: unknown): BookDocument | null {
  const all = normalizeBooksFromCell(raw);
  return all[0] ?? null;
}

export function coverUrl(path: string | undefined): string | null {
  return supabaseCoverPublicUrl(path);
}

export async function fetchBooks(): Promise<FetchBooksResult> {
  const { data, error } = await supabase
    .from("books")
    .select("id, data")
    .order("id", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const books: { id: number; document: BookDocument }[] = [];

  for (const row of rows) {
    for (const document of normalizeBooksFromCell(row.data)) {
      books.push({ id: row.id, document });
    }
  }

  if (__DEV__ && rows.length === 0) {
    console.warn(
      "[fetchBooks] 0 rows from public.books. If Postgres has data, add a SELECT policy for the anon role (see db/supabase-books-anon-select.sql).",
    );
  }

  return { books, tableRowCount: rows.length };
}

export async function fetchBookByBookId(
  bookId: string,
): Promise<{ id: number; document: BookDocument } | null> {
  const { data, error } = await supabase.from("books").select("id, data");

  if (error) throw error;

  for (const row of data ?? []) {
    for (const document of normalizeBooksFromCell(row.data)) {
      if (document.book_id === bookId) return { id: row.id, document };
    }
  }
  return null;
}

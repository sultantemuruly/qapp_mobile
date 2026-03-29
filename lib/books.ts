import type { BookDataColumn, BookDocument } from "@/db/schema";
import { supabase, supabaseCoverPublicUrl } from "@/lib/supabase";

export type BookRow = {
  id: number;
  data: BookDataColumn;
};

export function normalizeBookPayload(raw: unknown): BookDocument | null {
  if (raw == null || typeof raw !== "object") return null;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first == null || typeof first !== "object") return null;
  const doc = first as Partial<BookDocument>;
  if (
    typeof doc.book_id !== "string" ||
    typeof doc.title !== "string" ||
    !Array.isArray(doc.pages)
  ) {
    return null;
  }
  return first as BookDocument;
}

export function coverUrl(path: string | undefined): string | null {
  return supabaseCoverPublicUrl(path);
}

export async function fetchBooks(): Promise<
  { id: number; document: BookDocument }[]
> {
  const { data, error } = await supabase
    .from("books")
    .select("id, data")
    .order("id", { ascending: true });

  if (error) throw error;

  const out: { id: number; document: BookDocument }[] = [];
  for (const row of data ?? []) {
    const document = normalizeBookPayload(row.data);
    if (document) out.push({ id: row.id, document });
  }
  return out;
}

export async function fetchBookByBookId(
  bookId: string,
): Promise<{ id: number; document: BookDocument } | null> {
  const { data, error } = await supabase.from("books").select("id, data");

  if (error) throw error;

  for (const row of data ?? []) {
    const document = normalizeBookPayload(row.data);
    if (document?.book_id === bookId) return { id: row.id, document };
  }
  return null;
}

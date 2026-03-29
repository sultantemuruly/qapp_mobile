import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

/** Prefer JWT anon key; newer projects may only set the publishable key. */
const supabasePublicKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
  "";

/** From app.config.ts `extra` (reads SUPABASE_BOOK_COVERS_BUCKET at config time). */
const storageBucketFromExtra = (
  Constants.expoConfig?.extra?.supabaseBookCoversBucket as string | undefined
)?.trim();

const storageBucket =
  process.env.EXPO_PUBLIC_SUPABASE_BOOK_COVERS_BUCKET?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() ||
  storageBucketFromExtra ||
  process.env.SUPABASE_BOOK_COVERS_BUCKET?.trim() ||
  "public";

if (!supabaseUrl || !supabasePublicKey) {
  console.warn(
    "Supabase: set EXPO_PUBLIC_SUPABASE_URL and either EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabasePublicKey);

export function supabaseCoverPublicUrl(path: string | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  const encoded = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${encoded}`;
}

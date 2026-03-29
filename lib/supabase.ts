import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");

/** Default bucket for `cover_image_path`; override with EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET. */
const storageBucket =
  process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "public";

export function supabaseCoverPublicUrl(path: string | undefined): string | null {
  if (!path || !supabaseUrl) return null;
  const encoded = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${encoded}`;
}

import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    extra: {
      ...config.extra,
      supabaseBookCoversBucket:
        process.env.EXPO_PUBLIC_SUPABASE_BOOK_COVERS_BUCKET?.trim() ||
        process.env.SUPABASE_BOOK_COVERS_BUCKET?.trim() ||
        process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() ||
        "public",
    },
  }) as ExpoConfig;

import { coverUrl, fetchBooks } from "@/lib/books";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const GAP = 12;
const PAD = 16;
const COLS = 2;
const CARD_W = (width - PAD * 2 - GAP) / COLS;

export default function LibraryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<
    { id: number; title: string; bookId: string; cover: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchBooks();
      setItems(
        rows.map((r) => ({
          id: r.id,
          title: r.document.title,
          bookId: r.document.book_id,
          cover: coverUrl(r.document.cover_image_path),
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load books");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.screenTitle}>Library</Text>
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={load} style={styles.retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
      {!loading && !error && items.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.empty}>No books yet.</Text>
        </View>
      )}
      {!loading && !error && items.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {items.map((book) => (
            <Pressable
              key={book.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push(`/reader/${encodeURIComponent(book.bookId)}`)
              }
            >
              <View style={styles.coverWrap}>
                {book.cover ? (
                  <Image
                    source={{ uri: book.cover }}
                    style={styles.cover}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.cover, styles.coverPlaceholder]} />
                )}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {book.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#151718",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ECEDEE",
    paddingHorizontal: PAD,
    paddingBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  error: {
    color: "#ECEDEE",
    textAlign: "center",
    marginBottom: 12,
  },
  retry: {
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  empty: {
    color: "#9BA1A6",
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    paddingBottom: 24,
    gap: GAP,
  },
  card: {
    width: CARD_W,
  },
  cardPressed: {
    opacity: 0.85,
  },
  coverWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  cover: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#2C2C2C",
  },
  coverPlaceholder: {
    backgroundColor: "#333",
  },
  cardTitle: {
    color: "#ECEDEE",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
});

import { BookCarousel } from "@/components/books/book-carousel";
import { coverUrl, fetchBooks } from "@/lib/books";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForYouScreen() {
  const [items, setItems] = useState<
    {
      id: number;
      title: string;
      bookId: string;
      cover: string | null;
    }[]
  >([]);
  const [tableRowCount, setTableRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { books, tableRowCount: rowCount } = await fetchBooks();
      setTableRowCount(rowCount);
      setItems(
        books.map((r) => ({
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
    <SafeAreaView className="flex-1 bg-[#151718]" edges={["top"]}>
      <View className="px-4 pb-3 pt-1">
        <Text className="text-3xl font-bold text-[#ECEDEE]">For you</Text>
        <Text className="mt-1 text-sm text-[#9BA1A6]">
          Swipe through your library
        </Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}

      {!loading && error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-3 text-center text-base text-[#ECEDEE]">
            {error}
          </Text>
          <Pressable
            onPress={load}
            className="rounded-[10px] bg-[#2C2C2C] px-5 py-2.5 active:opacity-80"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-[#9BA1A6]">
            {tableRowCount === 0
              ? "No books returned from the server. If rows exist in Postgres, open the Supabase SQL editor and run db/supabase-books-anon-select.sql so the anon key can SELECT public.books."
              : "Received book rows but could not read the JSON. Ensure each data object has book_id (or bookId) and pages (array); title defaults to Untitled if missing."}
          </Text>
        </View>
      )}

      {!loading && !error && items.length > 0 && (
        <BookCarousel items={items} refreshing={refreshing} onRefresh={onRefresh} />
      )}
    </SafeAreaView>
  );
}

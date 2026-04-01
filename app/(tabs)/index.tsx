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
    <SafeAreaView className="flex-1 bg-[#121518]" edges={["top"]}>
      <View className="border-b border-white/[0.06] px-5 pb-4 pt-2">
        <Text className="text-[26px] font-semibold tracking-tight text-[#E8EAED]">
          For you
        </Text>
        <Text className="mt-1 text-[13px] font-normal leading-[18px] text-[#8B9399]">
          Swipe covers to browse · pull down to refresh
        </Text>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#8B9399" />
        </View>
      )}

      {!loading && error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-[15px] leading-[22px] text-[#C4C8CC]">
            {error}
          </Text>
          <Pressable
            onPress={load}
            className="rounded-xl border border-white/10 bg-[#1E2328] px-6 py-3 active:opacity-90"
          >
            <Text className="text-[15px] font-semibold text-[#E8EAED]">
              Retry
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] leading-[22px] text-[#8B9399]">
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

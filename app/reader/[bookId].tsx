import { PageElements } from "@/components/reader/page-elements";
import { fetchBookByBookId, coverUrl } from "@/lib/books";
import type { BookDocument } from "@/db/schema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ReadMode = "read" | "listen";

export default function ReaderScreen() {
  const router = useRouter();
  const { bookId: bookIdParam } = useLocalSearchParams<{ bookId: string }>();
  const bookId = bookIdParam ? decodeURIComponent(bookIdParam) : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<BookDocument | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [readMode, setReadMode] = useState<ReadMode>("read");

  const load = useCallback(async () => {
    if (!bookId) {
      setError("Missing book");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const row = await fetchBookByBookId(bookId);
      if (!row) {
        setError("Book not found");
        setDocument(null);
        return;
      }
      setDocument(row.document);
      setPageIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load book");
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = useMemo(() => {
    if (!document?.pages?.length) return [];
    return [...document.pages].sort(
      (a, b) => a.page_number - b.page_number,
    );
  }, [document]);

  const currentPage = pages[pageIndex] ?? null;
  const totalPages = document?.total_pages ?? pages.length ?? 0;
  const pageLabel = currentPage?.page_number ?? pageIndex + 1;
  const thumbUri = coverUrl(document?.cover_image_path);
  const progress =
    totalPages > 0 ? Math.min((pageIndex + 1) / totalPages, 1) : 0;

  const goNext = () => {
    if (pageIndex < pages.length - 1) setPageIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (pageIndex > 0) setPageIndex((i) => i - 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between bg-black px-3 pb-2.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close reader"
          className="active:opacity-70"
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>

        <View className="flex-row gap-1 rounded-[10px] bg-[#2C2C2C] p-0.5">
          <Pressable
            onPress={() => setReadMode("read")}
            className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 ${
              readMode === "read" ? "bg-[#E0E0E0]" : ""
            }`}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={readMode === "read" ? "#000" : "#AAA"}
            />
            <Text
              className={`text-[13px] font-semibold ${
                readMode === "read" ? "text-black" : "text-[#AAA]"
              }`}
            >
              Read
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setReadMode("listen")}
            className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 ${
              readMode === "listen" ? "bg-[#E0E0E0]" : ""
            }`}
          >
            <Ionicons
              name="headset-outline"
              size={18}
              color={readMode === "listen" ? "#000" : "#AAA"}
            />
            <Text
              className={`text-[13px] font-semibold ${
                readMode === "listen" ? "text-black" : "text-[#AAA]"
              }`}
            >
              Listen
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-3.5">
          <Pressable hitSlop={12} accessibilityRole="button">
            <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
          </Pressable>
          <Pressable hitSlop={12} accessibilityRole="button">
            <Text className="text-lg font-semibold text-white">AA</Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 bg-[#121212]">
        {loading && (
          <View className="flex-1 items-center justify-center p-6">
            <ActivityIndicator size="large" color="#E0E0E0" />
          </View>
        )}
        {!loading && error && (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="mb-4 text-center text-base text-[#E0E0E0]">
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
        {!loading && !error && document && readMode === "read" && currentPage && (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-[22px] pb-6 pt-2"
            showsVerticalScrollIndicator={false}
          >
            <PageElements elements={currentPage.elements} />
          </ScrollView>
        )}
        {!loading && !error && document && readMode === "listen" && (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="headset-outline" size={48} color="#666766" />
            <Text className="mt-4 text-base text-[#888888]">
              Audio coming soon
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-center gap-5 bg-black py-3">
        <Pressable
          onPress={goPrev}
          disabled={pageIndex <= 0}
          className={`h-10 w-10 items-center justify-center rounded-[10px] ${
            pageIndex <= 0 ? "bg-[#1A1A1A]" : "bg-[#2C2C2C] active:opacity-80"
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={pageIndex <= 0 ? "#444" : "#FFF"}
          />
        </Pressable>
        <Text className="min-w-[72px] text-center font-reader text-sm text-[#E0E0E0]">
          {pageLabel} of {totalPages || pages.length}
        </Text>
        <Pressable
          onPress={goNext}
          disabled={pageIndex >= pages.length - 1}
          className={`h-10 w-10 items-center justify-center rounded-[10px] ${
            pageIndex >= pages.length - 1
              ? "bg-[#1A1A1A]"
              : "bg-[#2C2C2C] active:opacity-80"
          }`}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={pageIndex >= pages.length - 1 ? "#444" : "#FFF"}
          />
        </Pressable>
      </View>

      {document && (
        <View className="mx-3 mb-3 flex-row items-center gap-3 rounded-xl bg-[#1E1E1E] px-3 py-2.5">
          {thumbUri ? (
            <Image
              source={{ uri: thumbUri }}
              className="h-12 w-12 rounded-md"
            />
          ) : (
            <View className="h-12 w-12 rounded-md bg-[#333333]" />
          )}
          <View className="min-w-0 flex-1 gap-2">
            <Text
              className="text-[15px] font-semibold text-[#E0E0E0]"
              numberOfLines={1}
            >
              {document.title}
            </Text>
            <View className="h-[3px] overflow-hidden rounded-sm bg-[#333333]">
              <View
                className="h-full rounded-sm bg-[#4A9EFF]"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
          </View>
          <Pressable hitSlop={12} accessibilityRole="button">
            <Ionicons name="play" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

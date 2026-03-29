import { PageElements } from "@/components/reader/page-elements";
import { Fonts } from "@/constants/theme";
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
  StyleSheet,
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close reader"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>

          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, readMode === "read" && styles.modeBtnActive]}
              onPress={() => setReadMode("read")}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={readMode === "read" ? "#000" : "#AAA"}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  readMode === "read" && styles.modeBtnTextActive,
                ]}
              >
                Read
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, readMode === "listen" && styles.modeBtnActive]}
              onPress={() => setReadMode("listen")}
            >
              <Ionicons
                name="headset-outline"
                size={18}
                color={readMode === "listen" ? "#000" : "#AAA"}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  readMode === "listen" && styles.modeBtnTextActive,
                ]}
              >
                Listen
              </Text>
            </Pressable>
          </View>

          <View style={styles.topBarRight}>
            <Pressable hitSlop={12} accessibilityRole="button">
              <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
            </Pressable>
            <Pressable hitSlop={12} accessibilityRole="button">
              <Text style={styles.aaIcon}>AA</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.main}>
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#E0E0E0" />
            </View>
          )}
          {!loading && error && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={load} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}
          {!loading && !error && document && readMode === "read" && currentPage && (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <PageElements elements={currentPage.elements} />
            </ScrollView>
          )}
          {!loading && !error && document && readMode === "listen" && (
            <View style={styles.centered}>
              <Ionicons name="headset-outline" size={48} color="#666766" />
              <Text style={styles.listenPlaceholder}>Audio coming soon</Text>
            </View>
          )}
        </View>

        <View style={styles.footerRow}>
          <Pressable
            onPress={goPrev}
            disabled={pageIndex <= 0}
            style={[styles.navSquare, pageIndex <= 0 && styles.navSquareDisabled]}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={pageIndex <= 0 ? "#444" : "#FFF"}
            />
          </Pressable>
          <Text style={[styles.pageIndicator, { fontFamily: Fonts.serif }]}>
            {pageLabel} of {totalPages || pages.length}
          </Text>
          <Pressable
            onPress={goNext}
            disabled={pageIndex >= pages.length - 1}
            style={[
              styles.navSquare,
              pageIndex >= pages.length - 1 && styles.navSquareDisabled,
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={pageIndex >= pages.length - 1 ? "#444" : "#FFF"}
            />
          </Pressable>
        </View>

        {document && (
          <View style={styles.miniPlayer}>
            {thumbUri ? (
              <Image source={{ uri: thumbUri }} style={styles.miniCover} />
            ) : (
              <View style={[styles.miniCover, styles.miniCoverPlaceholder]} />
            )}
            <View style={styles.miniCenter}>
              <Text style={styles.miniTitle} numberOfLines={1}>
                {document.title}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#000000",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  aaIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: "#E0E0E0",
  },
  modeBtnText: {
    color: "#AAA",
    fontSize: 13,
    fontWeight: "600",
  },
  modeBtnTextActive: {
    color: "#000000",
  },
  main: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#E0E0E0",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  listenPlaceholder: {
    color: "#888888",
    marginTop: 16,
    fontSize: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 12,
    backgroundColor: "#000000",
  },
  pageIndicator: {
    color: "#E0E0E0",
    fontSize: 14,
    minWidth: 72,
    textAlign: "center",
  },
  navSquare: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
  },
  navSquareDisabled: {
    backgroundColor: "#1A1A1A",
  },
  miniPlayer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    gap: 12,
  },
  miniCover: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  miniCoverPlaceholder: {
    backgroundColor: "#333",
  },
  miniCenter: {
    flex: 1,
    gap: 8,
  },
  miniTitle: {
    color: "#E0E0E0",
    fontSize: 15,
    fontWeight: "600",
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A9EFF",
    borderRadius: 2,
  },
});

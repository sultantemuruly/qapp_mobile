import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export type BookCarouselItem = {
  id: number;
  bookId: string;
  title: string;
  cover: string | null;
};

type BookCarouselProps = {
  items: BookCarouselItem[];
  refreshing: boolean;
  onRefresh: () => void;
};

/** Fraction of screen width per cover — smaller leaves a “peek” of neighbors. */
const CARD_WIDTH_RATIO = 0.46;
const CARD_GAP = 16;
/** Small inset from screen edge; list is not centered so the first card isn’t pushed in. */
const EDGE_INSET = 16;
const COVER_ASPECT = 2 / 3;

const refreshColors = {
  tint: "#9CA3AF",
  android: "#9CA3AF",
  androidBg: "#252A2E",
};

export function BookCarousel({
  items,
  refreshing,
  onRefresh,
}: BookCarouselProps) {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const cardWidth = Math.round(width * CARD_WIDTH_RATIO);
  const coverHeight = Math.round(cardWidth / COVER_ASPECT);
  const listBlockHeight = coverHeight + 56;

  const renderItem: ListRenderItem<BookCarouselItem> = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      style={{ width: cardWidth, marginRight: CARD_GAP }}
      className="active:opacity-90"
      onPress={() =>
        router.push(`/reader/${encodeURIComponent(item.bookId)}`)
      }
    >
      <View style={styles.coverShell} className="overflow-hidden rounded-[14px]">
        {item.cover ? (
          <Image
            source={{ uri: item.cover }}
            style={{ width: "100%", height: coverHeight }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={[styles.placeholder, { height: coverHeight }]}
            className="items-center justify-center"
          >
            <Text style={styles.placeholderGlyph}>◇</Text>
          </View>
        )}
      </View>
      <Text
        className="mt-2.5 px-0.5 text-center text-[13px] font-medium leading-[18px] tracking-tight text-[#C8CDD0]"
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </Pressable>
  );

  const list = (
    <FlatList
      data={items}
      keyExtractor={(item) => `${item.id}-${item.bookId}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + CARD_GAP}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
      renderItem={renderItem}
      nestedScrollEnabled
      style={{ height: listBlockHeight }}
      contentContainerStyle={{
        paddingLeft: EDGE_INSET,
        paddingRight: EDGE_INSET - CARD_GAP,
        paddingVertical: 6,
        alignItems: "flex-start",
      }}
    />
  );

  return (
    <ScrollView
      alwaysBounceVertical
      bounces
      overScrollMode="always"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: Math.max(height * 0.58, listBlockHeight + 48),
        paddingBottom: 28,
        justifyContent: "center",
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={refreshColors.tint}
          colors={[refreshColors.android]}
          progressBackgroundColor={refreshColors.androidBg}
          progressViewOffset={Platform.OS === "android" ? 8 : undefined}
        />
      }
    >
      {list}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  coverShell: {
    backgroundColor: "#1C2124",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  placeholder: {
    width: "100%",
    backgroundColor: "#252B30",
  },
  placeholderGlyph: {
    fontSize: 28,
    color: "rgba(255,255,255,0.14)",
    fontWeight: "300",
  },
});

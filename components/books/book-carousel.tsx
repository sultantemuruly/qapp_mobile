import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
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

const CARD_GAP = 20;

export function BookCarousel({
  items,
  refreshing,
  onRefresh,
}: BookCarouselProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const cardWidth = Math.round(width * 0.72);
  const sideInset = Math.max((width - cardWidth) / 2, 16);

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
      <View className="mb-3 overflow-hidden rounded-2xl">
        {item.cover ? (
          <Image
            source={{ uri: item.cover }}
            style={{ width: "100%", aspectRatio: 2 / 3 }}
            contentFit="cover"
          />
        ) : (
          <View className="aspect-[2/3] w-full bg-neutral-700" />
        )}
      </View>
      <Text
        className="text-center text-base font-semibold leading-6 text-[#ECEDEE]"
        numberOfLines={2}
      >
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <FlatList
      className="flex-1"
      data={items}
      keyExtractor={(item) => `${item.id}-${item.bookId}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + CARD_GAP}
      decelerationRate="fast"
      renderItem={renderItem}
      contentContainerStyle={{
        paddingLeft: sideInset,
        paddingRight: sideInset - CARD_GAP,
        paddingTop: 8,
        paddingBottom: 32,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#0a7ea4"
        />
      }
    />
  );
}

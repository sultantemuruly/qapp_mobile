import type { BookPageElement } from "@/db/schema";
import { Fonts } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

const serif = { fontFamily: Fonts.serif };

function KeywordsBlock({ items }: { items: string[] }) {
  return (
    <View style={styles.keywordsWrap}>
      {items.map((kw, i) => (
        <View key={`${kw}-${i}`} style={styles.keywordChip}>
          <Text style={[styles.keywordText, serif]}>{kw}</Text>
        </View>
      ))}
    </View>
  );
}

export function PageElements({ elements }: { elements: BookPageElement[] }) {
  return (
    <>
      {elements.map((el, i) => {
        switch (el.type) {
          case "chapter_name":
            return (
              <Text key={i} style={[styles.chapterTitle, serif]}>
                {el.content}
              </Text>
            );
          case "text":
            return (
              <Text key={i} style={[styles.bodyText, serif]}>
                {el.content}
              </Text>
            );
          case "quote":
            return (
              <View key={i} style={styles.quoteBlock}>
                <Text style={[styles.quoteMark, serif]}>❞</Text>
                <Text style={[styles.quoteBody, serif]}>{el.content}</Text>
              </View>
            );
          case "keywords":
            return <KeywordsBlock key={i} items={el.content} />;
          default:
            return null;
        }
      })}
    </>
  );
}

const styles = StyleSheet.create({
  chapterTitle: {
    color: "#F0F0F0",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: 28,
  },
  bodyText: {
    color: "#E0E0E0",
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 20,
  },
  quoteBlock: {
    marginBottom: 24,
    paddingLeft: 8,
  },
  quoteMark: {
    color: "#9E9E9E",
    fontSize: 42,
    lineHeight: 44,
    marginBottom: 4,
  },
  quoteBody: {
    color: "#ECECEC",
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 30,
  },
  keywordsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  keywordChip: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  keywordText: {
    color: "#CFCFCF",
    fontSize: 14,
  },
});

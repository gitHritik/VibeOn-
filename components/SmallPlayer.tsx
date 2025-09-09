import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function SmallPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  return (
    <Pressable style={styles.container} onPress={() => router.push("/player")}>
      {/* Thumbnail */}
      <Image
        source={{
          uri: "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/saiyaara-et00447951-1752737895.jpg",
        }}
        style={styles.thumbnail}
      />

      {/* Song Info */}
      <View style={styles.textContainer}>
        <Text style={styles.song} numberOfLines={1}>
          Blinding Lights
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          The Weeknd
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={28}
            color="#fff"
          />
        </Pressable>

        <Pressable>
          <Ionicons name="play-skip-forward" size={28} color="#fff" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E1E1E",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  song: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  artist: {
    color: "#aaa",
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginLeft: 10,
  },
});

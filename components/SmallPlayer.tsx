import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function SmallPlayer() {
  const { currentSong, isPlaying, togglePlayPause, playNext } = usePlayer();

  const router = useRouter();

  if (!currentSong) return null;

  return (
    <Pressable style={styles.container} onPress={() => router.push("/player")}>
      <Image source={{ uri: currentSong.thumbnail }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.song}>{currentSong.title}</Text>
        <Text style={styles.artist}>{currentSong.artist}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={28}
            color="#fff"
          />
        </Pressable>
        <Pressable onPress={() => playNext()}>
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
  thumbnail: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  textContainer: { flex: 1 },
  song: { color: "#fff", fontSize: 16, fontWeight: "600" },
  artist: { color: "#aaa", fontSize: 14 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginLeft: 10,
  },
});

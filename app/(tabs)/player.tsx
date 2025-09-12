import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Player() {
  const { currentSong, isPlaying, togglePlayPause } = usePlayer();

  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentSong.thumbnail }} style={styles.albumArt} />
      <Text style={styles.songTitle}>{currentSong.title}</Text>
      <Text style={styles.artist}>{currentSong.artist}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FF4C29"
        maximumTrackTintColor="#555"
        thumbTintColor="#FF4C29"
      />

      <View style={styles.controls}>
        <Pressable>
          <Ionicons name="play-skip-back" size={36} color="#fff" />
        </Pressable>
        <Pressable onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="#fff"
          />
        </Pressable>
        <Pressable>
          <Ionicons name="play-skip-forward" size={36} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  albumArt: { width: 250, height: 250, borderRadius: 20, marginBottom: 30 },
  songTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  artist: { fontSize: 16, color: "#aaa", marginBottom: 20 },
  slider: { width: "90%", height: 40, marginBottom: 20 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
  },
  playButton: { backgroundColor: "#FF4C29", borderRadius: 50, padding: 15 },
});

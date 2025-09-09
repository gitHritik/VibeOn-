import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.container}>
      {/* Album Art */}
      <Image
        source={{
          uri: "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/saiyaara-et00447951-1752737895.jpg",
        }}
        style={styles.albumArt}
      />

      {/* Song Info */}
      <Text style={styles.songTitle}>Blinding Lights</Text>
      <Text style={styles.artist}>The Weeknd</Text>

      {/* Progress Bar */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FF4C29"
        maximumTrackTintColor="#555"
        thumbTintColor="#FF4C29"
      />
      <View style={styles.timeRow}>
        <Text style={styles.time}>0:32</Text>
        <Text style={styles.time}>3:45</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable>
          <Ionicons name="play-skip-back" size={36} color="#fff" />
        </Pressable>

        <Pressable
          onPress={() => setIsPlaying(!isPlaying)}
          style={styles.playButton}
        >
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
    padding: 20,
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  artist: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
  },
  slider: {
    width: "90%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 30,
  },
  time: {
    color: "#aaa",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
  },
  playButton: {
    backgroundColor: "#FF4C29",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
});

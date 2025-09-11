import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddedMusic from "../../components/AddedMusic";
import Searchbar from "./../../components/Searchbar";
import SmallPlayer from "./../../components/SmallPlayer";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);

  // 🔹 Load songs from storage when app starts
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const saved = await AsyncStorage.getItem("songs");
        if (saved) setSongs(JSON.parse(saved));
        console.log("Saved" + saved);
      } catch (err) {
        console.error("Error loading songs:", err);
      }
    };
    loadSongs();
  }, []);

  // 🔹 Save songs whenever list changes
  useEffect(() => {
    const saveSongs = async () => {
      try {
        await AsyncStorage.setItem("songs", JSON.stringify(songs));
      } catch (err) {
        console.error("Error saving songs:", err);
      }
    };
    saveSongs();
  }, [songs]);

  // Add Music from storage
  const handleAddMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const newSong: Song = {
        id: Date.now().toString(),
        title: file.name.replace(".mp3", ""),
        artist: "Unknown",
        thumbnail: "https://via.placeholder.com/150",
        uri: file.uri,
      };

      setSongs((prev) => [...prev, newSong]);
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar />
      {songs.length > 0 ? (
        <AddedMusic handleMusic={handleAddMusic} songs={songs} />
      ) : (
        <>
          <Text style={styles.title}>🎵 Music</Text>
          <Text style={styles.subtitle}>
            No songs yet. Add music from your local storage to start vibing 🎶
          </Text>

          {/* Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && {
                backgroundColor: "#e64520",
                transform: [{ scale: 0.97 }],
              },
            ]}
            onPress={handleAddMusic}
          >
            <Text style={styles.buttonText}>+ Add Music</Text>
          </Pressable>
        </>
      )}

      <SmallPlayer />
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4C29",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF4C29",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

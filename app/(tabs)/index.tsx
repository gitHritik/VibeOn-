import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddedMusic from "../../components/AddedMusic";
import Searchbar from "../../components/Searchbar";
import SmallPlayer from "../../components/SmallPlayer";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

const images = [
  "https://pbs.twimg.com/media/G0jJL5Va4AAFSVF.jpg",
  "https://i1.sndcdn.com/artworks-000179580652-qskijz-t1080x1080.jpg",
  // you can add more URLs here in the future
];

// Utility function to get random item
const getRandomImage = () => {
  const random = Math.floor(Math.random() * images.length);
  return images[random];
};

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");

  //filtering teh songs for search bar
  const filteredSongs = songs.filter((song) => {
    song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    const loadSongs = async () => {
      const data = await AsyncStorage.getItem("songs");
      if (data) {
        setSongs((prev) => [...prev, JSON.parse(data)]);
      }
    };

    loadSongs();
  });

  useEffect(() => {
    AsyncStorage.setItem("songs", JSON.stringify(songs));
  }, [songs]);

  const handleAddMusic = async () => {
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
      thumbnail: getRandomImage(),
      uri: file.uri,
    };

    setSongs((prev) => [...prev, newSong]);
  };

  // console.log(filteredSongs);

  const handleDeleteSongs = (ids: string[]) => {
    setSongs((prev) => prev.filter((song) => !ids.includes(song.id)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar value={search} onChangeText={setSearch} />
      {filteredSongs.length > 0 ? (
        <AddedMusic
          handleMusic={handleAddMusic}
          onDeleteSongs={handleDeleteSongs}
          songs={filteredSongs}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.title}>🎵 Music</Text>
          <Text style={styles.subtitle}>
            No songs yet. Add music from your local storage 🎶
          </Text>
          <Pressable style={styles.button} onPress={handleAddMusic}>
            <Text style={styles.buttonText}>+ Add Music</Text>
          </Pressable>
        </View>
      )}
      <SmallPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4C29",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: { fontSize: 16, color: "#ccc", textAlign: "center" },
  button: {
    marginTop: 20,
    backgroundColor: "#FF4C29",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

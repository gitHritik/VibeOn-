import * as MediaLibrary from "expo-media-library";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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

// const images = [
//   "https://pbs.twimg.com/media/G0jJL5Va4AAFSVF.jpg",
//   "https://i1.sndcdn.com/artworks-000179580652-qskijz-t1080x1080.jpg",
//   // add more thumbnails if you want
// ];

// Utility function → pick random image

export default function Index() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");

  // filter songs based on search
  const filteredSongs = songs.filter(
    (song) =>
      song.title?.toLowerCase().includes(search.toLowerCase()) ||
      song.artist?.toLowerCase().includes(search.toLowerCase())
  );

  // 🚀 Load all local songs from device storage
  useEffect(() => {
    const loadAllSongs = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your music files."
        );
        return;
      }

      // fetch audio files
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 500, // adjust depending on how many you want
      });

      // map files into your Song type
      const allSongs: Song[] = media.assets.map((file) => ({
        id: file.id,
        title: file.filename.replace(".mp3", ""),
        artist: "Hrk", // Needs ID3 parsing for real metadata
        thumbnail: file.uri,
        uri: file.uri,
      }));

      setSongs(allSongs);
    };

    loadAllSongs();
  }, []);

  //second way only works with normal android and ios devices not expo

  // useEffect(() => {
  //   const loadAllSongs = async () => {
  //     try {
  //       const { status } = await MediaLibrary.requestPermissionsAsync();
  //       if (status !== "granted") {
  //         Alert.alert(
  //           "Permission required",
  //           "We need access to your music files."
  //         );
  //         return;
  //       }

  //       const songs = await MusicFiles?.getAll({
  //         id: true,
  //         blured: false,
  //         artist: true,
  //         duration: true,
  //         cover: true,
  //         batchNumber: 0,
  //         minimumSongDuration: 10000,
  //       });

  //       const formattedSongs = songs.map((file: any) => ({
  //         id: file.id,
  //         title: file.title,
  //         artist: file.author || "Unknown",
  //         thumbnail: file.cover, // this will be a base64 string
  //         uri: file.path,
  //       }));

  //       setSongs(formattedSongs);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   loadAllSongs();
  // }, []);

  // console.log(songs[0]);

  // delete songs
  const handleDeleteSongs = async (ids: string[]) => {
    await MediaLibrary.deleteAssetsAsync([ids[0]]);
    ``;
    setSongs((prev) => prev.filter((song) => !ids.includes(song.id)));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔍 Search Bar */}
      <Searchbar value={search} onChangeText={setSearch} />

      {filteredSongs.length > 0 ? (
        <AddedMusic
          handleMusic={() => {}} // not needed anymore
          onDeleteSongs={handleDeleteSongs}
          songs={filteredSongs}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.title}>🎵 Music</Text>
          <Text style={styles.subtitle}>
            No songs found in storage. Add some music to your device 🎶
          </Text>
        </View>
      )}

      {/* Mini Player */}
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

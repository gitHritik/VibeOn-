import SmallPlayer from "@/components/SmallPlayer";
import { useFavourites } from "@/context/FavouriteContext";
import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Song interface
interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

export default function Favourite() {
  const { toggleFavourite, favouriteSongs } = useFavourites();
  const { playSong } = usePlayer();
  const router = useRouter();

  const renderSong = ({ item }: { item: Song }) => (
    <Pressable onPress={() => playSong(item, favouriteSongs)}>
      <View style={styles.songCard}>
        <Image
          source={require("../../assets/thumbnail/default-img.jpg")}
          style={styles.thumbnail}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{item.title}</Text>
          <Text style={styles.songArtist}>{item.artist}</Text>
        </View>
        <Pressable onPress={() => toggleFavourite(item)}>
          <Ionicons name="heart" size={26} color="#FF4C29" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color="#FF4C29" />
        <Text style={styles.headerTitle}>Favourites</Text>
      </View>

      {/* Content */}
      {favouriteSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike" size={70} color="#555" />
          <Text style={styles.emptyText}>No songs in favourites yet</Text>
          <Pressable style={styles.addButton} onPress={() => router.push("/")}>
            <Ionicons name="add" size={28} color="#fff" />
            <Text style={styles.addText}>Add a song</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favouriteSongs}
          keyExtractor={(item) => item.id}
          renderItem={renderSong}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
      {/* Mini Player */}
      <SmallPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", paddingTop: 50 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  // Song Card
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: { width: 55, height: 55, borderRadius: 8, marginRight: 12 },
  songInfo: { flex: 1 },
  songTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  songArtist: { color: "#aaa", fontSize: 14 },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  addButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4C29",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  addText: { color: "#fff", fontSize: 16, marginLeft: 8, fontWeight: "600" },
});

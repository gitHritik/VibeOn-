import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface AddedMusicProps {
  songs: Song[];
}

export default function AddedMusic({ songs }: AddedMusicProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songCard}>
            {/* Thumbnail */}
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />

            {/* Song Info */}
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.artist}
              </Text>
            </View>

            {/* Play Button */}
            <TouchableOpacity>
              <Ionicons name="play-circle" size={28} color="#FF4C29" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // spread thumbnail+info and play button
    width: "100%", // take full width
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333", // divider between songs
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1, // takes remaining space between thumbnail & play button
    justifyContent: "center",
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  songArtist: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },
  floatingButton: {
    position: "absolute",
    bottom: 65,
    right: 0,
    backgroundColor: "#FF4C29",
    borderRadius: 50,
    padding: 16,
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

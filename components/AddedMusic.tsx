import { useFavourites } from "@/context/FavouriteContext";
import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

interface AddedMusicProps {
  songs: Song[];
  handleMusic: () => void;
  onDeleteSongs: (ids: string[]) => void; // 👈 parent handles deletion
}

export default function AddedMusic({
  songs,
  handleMusic,
  onDeleteSongs,
}: AddedMusicProps) {
  const { playSong, currentSong } = usePlayer();

  const { toggleFavourite, favouriteSongs } = useFavourites();

  // Track selected songs
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedSongs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // const isFavourite = (id: string) => favourite.includes(id);
  const isSelected = (id: string) => selectedSongs.includes(id);
  const areAllSelectedFav = selectedSongs.every((id) =>
    favouriteSongs.some((song) => song.id === id)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={
              () =>
                selectedSongs.length > 0
                  ? toggleSelect(item.id) // if already selecting, continue selecting
                  : playSong(item, songs) // normal play if nothing is selected
            }
            onLongPress={() => toggleSelect(item.id)} // start selection
          >
            <View style={styles.songCard}>
              {/* Thumbnail with tick overlay */}
              <View>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={[
                    styles.thumbnail,
                    isSelected(item.id) && { opacity: 0.5 },
                  ]}
                />
                {isSelected(item.id) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#4CAF50"
                    style={styles.tick}
                  />
                )}
              </View>

              {/* Song Info */}
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{item.title}</Text>
                <Text style={styles.songArtist}>{item.artist}</Text>
              </View>

              {/* Play Button (disabled if selecting) */}
              {selectedSongs.length === 0 && (
                <Pressable onPress={() => playSong(item)}>
                  <Ionicons name="play-circle" size={28} color="#FF4C29" />
                </Pressable>
              )}
            </View>
          </Pressable>
        )}
      />

      {/* Floating Add Button */}
      {selectedSongs.length === 0 && (
        <Pressable
          style={[
            styles.floatingButton,
            currentSong ? { bottom: 68 } : { bottom: 10 },
          ]}
          onPress={handleMusic}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      )}

      {/* Delete Button (shows when songs selected) */}
      {selectedSongs.length > 0 && (
        <>
          {/* Delete button (bottom-right) */}
          <Pressable
            style={[
              styles.deleteButton,
              currentSong ? { bottom: 68 } : { bottom: 10 },
            ]}
            onPress={() => {
              onDeleteSongs(selectedSongs);
              setSelectedSongs([]); // clear selection
            }}
          >
            <Ionicons name="trash" size={26} color="#fff" />
          </Pressable>

          {/* Favourite button (bottom-left) */}
          <Pressable
            style={[
              styles.favouriteButton,
              currentSong ? { bottom: 68 } : { bottom: 10 },
            ]}
            onPress={() => {
              // loop through selected songs and toggle them as favourite
              const selected = songs.filter((s) =>
                selectedSongs.includes(s.id)
              );
              selected.forEach((song) => toggleFavourite(song));

              setSelectedSongs([]); // clear selection
            }}
          >
            <Ionicons
              name="heart"
              size={26}
              color={areAllSelectedFav ? "#FF4C29" : "white"}
            />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  thumbnail: { width: 55, height: 55, borderRadius: 8, marginRight: 12 },
  tick: {
    position: "absolute",
    top: "35%",
    left: "35%",
  },
  songInfo: { flex: 1 },
  songTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  songArtist: { color: "#aaa", fontSize: 14 },
  floatingButton: {
    position: "absolute",
    right: 0,
    backgroundColor: "#FF4C29",
    borderRadius: 50,
    padding: 16,
    zIndex: 10,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    backgroundColor: "#E53935",
    borderRadius: 50,
    padding: 16,
    zIndex: 10,
  },
  favouriteButton: {
    position: "absolute",
    left: 10, // 👈 bottom-left
    backgroundColor: "#1E1E1E",
    padding: 19,
    borderRadius: 50,
    elevation: 5,
  },
});

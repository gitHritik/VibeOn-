import { Song, usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlayList } from "./../../context/PlayListContext";

export default function PlaylistDetailScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const router = useRouter();

  const { currentSong, isPlaying, playSong } = usePlayer();

  const { removeFromPlaylist, getPlaylistById } = usePlayList();

  const [isEditMode, setIsEditMode] = useState(false);

  const playlist = getPlaylistById(playlistId || "");

  if (!playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="musical-notes-outline" size={64} color="#666" />
          <Text style={styles.errorText}>Playlist not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handlePlaySong = (song: Song) => {
    playSong(song, playlist.songs);
  };

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDeleteSong = (songId: string, songTitle: string) => {
    Alert.alert(
      "Remove Song",
      `Remove "${songTitle}" from "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await removeFromPlaylist(playlist.id, songId);
            if (!success) {
              Alert.alert("Error", "Failed to remove song from playlist");
            }
          },
        },
      ]
    );
  };

  //   const formatDuration = (seconds: number) => {
  //     const mins = Math.floor(seconds / 60);
  //     const secs = Math.floor(seconds % 60);
  //     return `${mins}:${secs.toString().padStart(2, "0")}`;
  //   };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentSong && styles.currentSongItem]}
        onPress={() => [handlePlaySong(item), router.push("/player")]}
      >
        <View style={styles.songIndex}>
          {isCurrentSong && isPlaying ? (
            <Ionicons name="volume-high" size={16} color="#FF4C29" />
          ) : (
            <Text
              style={[
                styles.indexText,
                isCurrentSong && styles.currentIndexText,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>

        <Image
          source={require("../../assets/thumbnail/default-img.jpg")}
          style={styles.songImage}
        />

        <View style={styles.songInfo}>
          <Text
            style={[styles.songTitle, isCurrentSong && styles.currentSongTitle]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>

        {isEditMode ? (
          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteSong(item.id, item.title)}
          >
            <Ionicons name="remove-circle" size={24} color="#ff4444" />
          </Pressable>
        ) : (
          <Pressable style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={16} color="#666" />
          </Pressable>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.playlistHeader}>
      <View style={styles.playlistArt}>
        {playlist.songs.length > 0 ? (
          <Image
            source={require("../../assets/thumbnail/default-img.jpg")}
            style={styles.playlistImage}
          />
        ) : (
          <Ionicons name="musical-notes" size={64} color="#666" />
        )}
      </View>

      <View style={styles.playlistMeta}>
        <Text style={styles.playlistTitle}>{playlist.name}</Text>
        <Text style={styles.playlistStats}>
          {playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.playlistDate}>
          Created {playlist.createdAt.toLocaleDateString()}
        </Text>
      </View>

      {playlist.songs.length > 0 && (
        <View style={styles.playlistActions}>
          <Pressable style={styles.playAllButton} onPress={handlePlayAll}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.playAllText}>Play All</Text>
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <Ionicons
              name={isEditMode ? "checkmark" : "pencil"}
              size={20}
              color="#fff"
            />
          </Pressable>
        </View>
      )}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-note-outline" size={48} color="#666" />
      <Text style={styles.emptyTitle}>No songs yet</Text>
      <Text style={styles.emptySubtitle}>
        Add songs to this playlist from the music library
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>

        <Text style={styles.headerTitle}>Playlist</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Song List */}
      <FlatList
        data={playlist.songs}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 40, // Balance the back button
  },

  // Playlist Header
  listContainer: {
    paddingBottom: 20,
  },
  playlistHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  playlistArt: {
    width: 200,
    height: 200,
    borderRadius: 15,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  playlistImage: {
    width: "100%",
    height: "100%",
  },
  playlistMeta: {
    alignItems: "center",
    marginBottom: 25,
  },
  playlistTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  playlistStats: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 4,
  },
  playlistDate: {
    color: "#666",
    fontSize: 14,
  },
  playlistActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4C29",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#444",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  // Song Items
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  currentSongItem: {
    backgroundColor: "rgba(255, 76, 41, 0.1)",
  },
  songIndex: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  indexText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  currentIndexText: {
    color: "#FF4C29",
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  currentSongTitle: {
    color: "#FF4C29",
  },
  songArtist: {
    color: "#aaa",
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#FF4C29",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

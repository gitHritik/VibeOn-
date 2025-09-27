import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlayList } from "./../../context/PlayListContext";

export default function PlaylistsScreen() {
  const { playlists, createPlaylist, deletePlaylist } = usePlayList();

  const { currentSong, isPlaying } = usePlayer();
  // console.log(playlists);

  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Handle creating new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreateModal(false);
      Alert.alert("Success", `Created "${newPlaylistName}" playlist`);
    } catch (error: any) {
      Alert.alert(error, "Failed to create playlist");
    }
  };

  // Handle deleting playlist
  const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlistName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deletePlaylist(playlistId);
            if (success) {
              Alert.alert("Success", "Playlist deleted");
            } else {
              Alert.alert("Error", "Failed to delete playlist");
            }
          },
        },
      ]
    );
  };

  // Handle playlist press - navigate to playlist detail
  const handlePlaylistPress = (playlistId: string) => {
    router.push(`/playlist/${playlistId}` as any);
  };

  // Render individual playlist item
  const renderPlaylistItem = ({ item }: { item: (typeof playlists)[0] }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handlePlaylistPress(item.id)}
    >
      <View style={styles.playlistIcon}>
        <Ionicons name="musical-notes" size={24} color="#FF4C29" />
      </View>

      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistSongCount}>
          {item.songs.length} song{item.songs.length !== 1 ? "s" : ""}
        </Text>
        {item.songs.length > 0 && (
          <Text style={styles.playlistPreview}>
            {item.songs
              .slice(0, 2)
              .map((song) => song.title)
              .join(", ")}
            {item.songs.length > 2 ? "..." : ""}
          </Text>
        )}
      </View>

      <View style={styles.playlistActions}>
        {item.id !== "1" &&
          item.id !== "2" && ( // Don't show delete for default playlists
            <Pressable
              style={styles.actionButton}
              onPress={() => handleDeletePlaylist(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={20} color="#666" />
            </Pressable>
          )}

        <Pressable style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Playlists</Text>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Currently Playing Banner */}
      {currentSong && (
        <TouchableOpacity
          style={styles.nowPlayingBanner}
          onPress={() => router.push("/(tabs)/player")}
        >
          <Image
            source={require("../../assets/thumbnail/default-img.jpg")}
            style={styles.nowPlayingImage}
          />
          <View style={styles.nowPlayingInfo}>
            <Text style={styles.nowPlayingTitle} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.nowPlayingArtist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#FF4C29"
          />
        </TouchableOpacity>
      )}

      {/* Playlists List */}
      <FlatList
        data={playlists}
        renderItem={renderPlaylistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.playlistsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createPlaylistModal}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Enter playlist name..."
              placeholderTextColor="#666"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.createButtonModal]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.buttonText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#FF4C29",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Now Playing Banner
  nowPlayingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 10,
  },
  nowPlayingImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  nowPlayingInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  nowPlayingTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  nowPlayingArtist: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },

  // Playlists List
  playlistsList: {
    paddingHorizontal: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  playlistIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playlistName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  playlistSongCount: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 2,
  },
  playlistPreview: {
    color: "#666",
    fontSize: 12,
  },
  playlistActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  createPlaylistModal: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 30,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  createButtonModal: {
    backgroundColor: "#FF4C29",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

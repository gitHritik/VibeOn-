import { usePlayer } from "@/context/PlayerContext";
import { Ionicons } from "@expo/vector-icons";

import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlayList } from "./../context/PlayListContext";

export default function Player() {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    position,
    duration,
    seekTo,
    playNext,
    playPrevious,
    loopMode,
    toggleLoopMode,
  } = usePlayer();

  const { playlists, addToPlaylist, createPlaylist } = usePlayList();

  // Local state for modals
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  if (!currentSong) return null;

  // Format seconds -> mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Get loop icon based on current mode
  const getLoopIcon = () => {
    switch (loopMode) {
      case "one":
        return "repeat-outline";
      case "all":
        return "repeat";
      default:
        return "repeat-outline";
    }
  };

  console.log(currentSong);

  // Get loop icon color based on current mode
  const getLoopIconColor = () => {
    return loopMode === "none" ? "#666" : "#FF4C29";
  };

  // Handle adding to playlist
  const handleAddToPlaylist = async (
    playlistId: string,
    playlistName: string
  ) => {
    const success = await addToPlaylist(playlistId, currentSong);
    if (success) {
      Alert.alert(
        "Added to Playlist",
        `"${currentSong.title}" has been added to "${playlistName}"`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Error",
        "Song is already in this playlist or an error occurred"
      );
    }
    setShowPlaylistModal(false);
  };

  // Handle creating new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }

    try {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      if (currentSong) {
        await addToPlaylist(newPlaylist.id, currentSong);
        Alert.alert(
          "Success",
          `Created "${newPlaylistName}" and added "${currentSong.title}"`
        );
      }
      setNewPlaylistName("");
      setShowCreatePlaylistModal(false);
      setShowPlaylistModal(false);
    } catch (error: any) {
      Alert.alert(error, "Failed to create playlist");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/thumbnail/default-img.jpg")}
        style={styles.albumArt}
      />
      <Text style={styles.songTitle}>{currentSong.title}</Text>
      <Text style={styles.artist}>{currentSong.artist}</Text>

      {/* Progress bar with current time */}
      <Slider
        style={styles.slider}
        value={position}
        minimumValue={0}
        maximumValue={duration || 1}
        minimumTrackTintColor="#FF4C29"
        maximumTrackTintColor="#555"
        thumbTintColor="#FF4C29"
        onSlidingComplete={seekTo}
      />

      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      {/* Additional controls (loop and playlist) */}
      <View style={styles.additionalControls}>
        <Pressable onPress={toggleLoopMode} style={styles.controlButton}>
          <Ionicons name={getLoopIcon()} size={24} color={getLoopIconColor()} />
          {loopMode === "one" && (
            <View style={styles.loopOneBadge}>
              <Text style={styles.loopOneBadgeText}>1</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => setShowPlaylistModal(true)}
          style={styles.controlButton}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Main playback controls */}
      <View style={styles.controls}>
        <Pressable onPress={playPrevious}>
          <Ionicons name="play-skip-back" size={36} color="#fff" />
        </Pressable>

        <Pressable onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="#fff"
          />
        </Pressable>

        <Pressable onPress={playNext}>
          <Ionicons name="play-skip-forward" size={36} color="#fff" />
        </Pressable>
      </View>

      {/* Playlist Selection Modal */}
      <Modal
        visible={showPlaylistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <Pressable
                onPress={() => setShowPlaylistModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView style={styles.playlistList}>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistItem}
                  onPress={() =>
                    handleAddToPlaylist(playlist.id, playlist.name)
                  }
                >
                  <Ionicons name="musical-notes" size={20} color="#FF4C29" />
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.songCount}>
                    ({playlist.songs.length})
                  </Text>
                  <Ionicons name="add" size={20} color="#666" />
                </TouchableOpacity>
              ))}

              {/* Create New Playlist Option */}
              <TouchableOpacity
                style={styles.playlistItem}
                onPress={() => setShowCreatePlaylistModal(true)}
              >
                <Ionicons name="add-circle" size={20} color="#FF4C29" />
                <Text style={styles.playlistName}>Create New Playlist</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create New Playlist Modal */}
      <Modal
        visible={showCreatePlaylistModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreatePlaylistModal(false)}
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
                  setShowCreatePlaylistModal(false);
                  setNewPlaylistName("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.createButton]}
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
    alignItems: "center",
    justifyContent: "center",
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
  },
  artist: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 20,
  },
  slider: {
    width: "90%",
    height: 40,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  time: {
    color: "#aaa",
    fontSize: 12,
  },

  // Additional controls
  additionalControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "50%",
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
    position: "relative",
  },
  loopOneBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF4C29",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loopOneBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  playlistList: {
    padding: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#2A2A2A",
  },
  playlistName: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  songCount: {
    color: "#666",
    fontSize: 14,
    marginRight: 10,
  },

  // Create playlist modal
  createPlaylistModal: {
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 25,
    marginHorizontal: 30,
    alignSelf: "center",
    width: "85%",
    maxWidth: 400,
  },
  textInput: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    marginVertical: 20,
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
  createButton: {
    backgroundColor: "#FF4C29",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

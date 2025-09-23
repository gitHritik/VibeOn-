// contexts/PlayerContext.tsx
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type Song = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
};

export type LoopMode = "none" | "one" | "all";

type PlayerContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  loopMode: LoopMode;
  playSong: (song: Song, list?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setLoopMode: (mode: LoopMode) => void;
  toggleLoopMode: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = (): PlayerContextType => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // create a single persistent player (no initial source)
  const player = useAudioPlayer(null, 500); // null = no source initially, 500ms update
  const status = useAudioPlayerStatus(player); // gives currentTime, duration, isPlaying, etc.

  // state for queue + current index + current song
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    const getCurrentSong = async () => {
      try {
        const response = await AsyncStorage.getItem("currentSong");
        if (response) {
          setCurrentSong(JSON.parse(response));
        }
      } catch (error) {
        console.error("Failed to load playlists from storage:", error);
      }
    };
    getCurrentSong();
  }, []);

  useEffect(() => {
    const setSongs = async () => {
      try {
        await AsyncStorage.setItem("currentSong", JSON.stringify(currentSong));
      } catch (error) {
        console.error("Failed to load playlists from storage:", error);
      }
    };
    setSongs();
  }, [currentSong]);

  // New state for loop mode and playlists
  const [loopMode, setLoopMode] = useState<LoopMode>("none");
  // Remove this console.log - it causes re-renders to be visible

  // Guard so we only auto-advance once per finish event
  const finishedRef = useRef(false);

  // audio mode (background play / silent mode)
  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionModeAndroid: "duckOthers",
          interruptionMode: "mixWithOthers",
        });
      } catch (e) {
        console.warn("setAudioModeAsync failed", e);
      }
    })();
  }, []);

  // Helper: play the item at queue[index], replace player source and start
  const playIndex = useCallback(
    async (index: number, replaceList?: Song[]) => {
      try {
        if (!player) return;
        const list = replaceList ?? queue;
        if (!list || index < 0 || index >= list.length) return;

        const song = list[index];

        // replace the player's source with the new track, then play
        player.replace(song.uri);
        setCurrentSong(song);
        setCurrentIndex(index);
        setQueue(list);
        player.play();
      } catch (err) {
        console.error("playIndex error:", err);
      }
    },
    [player, queue]
  );

  // Play a song (optional list provided to set the queue)
  const playSong = useCallback(
    async (song: Song, list?: Song[]) => {
      try {
        if (!player) return;
        if (player) {
          player.pause(); // or pause/unload depending on your hook
        }

        if (list && list.length > 0) {
          // find index in provided list or fallback to 0
          const idx = list.findIndex((s) => s.id === song.id);
          await playIndex(idx >= 0 ? idx : 0, list);
          return;
        }

        // no list provided: try to find in existing queue
        const idxInQueue = queue.findIndex((s) => s.id === song.id);
        if (idxInQueue >= 0) {
          await playIndex(idxInQueue);
          return;
        }

        // fallback: play single-song queue
        await playIndex(0, [song]);
      } catch (err) {
        console.error("playSong error:", err);
      }
    },
    [player, queue, playIndex]
  );

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    try {
      if (!player) return;
      if (status?.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error("togglePlayPause error:", err);
    }
  }, [player, status?.playing]);

  // Seek to seconds
  const seekTo = useCallback(
    async (seconds: number) => {
      try {
        if (!player) return;
        await player.seekTo(Math.max(0, seconds)); //this one push the player slider
      } catch (err) {
        console.error("seekTo error:", err);
      }
    },
    [player]
  );

  // Next / Previous with loop mode support
  const playNext = useCallback(async () => {
    try {
      if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        await playIndex(currentIndex + 1);
      } else if (loopMode === "all" && queue.length > 0) {
        // Loop back to first song when at end and loop all is enabled
        await playIndex(0);
      } else if (loopMode === "one" && currentIndex >= 0) {
        // Replay current song if loop one is enabled
        await playIndex(currentIndex);
      } else {
        if (currentIndex === queue.length - 1) {
          await playIndex(0);
        }
      }
      // For loopMode === 'none', do nothing (stop at end)
    } catch (err) {
      console.error("playNext error:", err);
    }
  }, [currentIndex, queue.length, playIndex, loopMode]);

  const playPrevious = useCallback(async () => {
    try {
      if (!player) return;
      // If we've played more than 3s, just go to start of track
      const pos = status?.currentTime ?? 0;
      if (pos > 3 && currentIndex >= 0) {
        await player.seekTo(0);
        return;
      }

      if (currentIndex > 0) {
        await playIndex(currentIndex - 1);
      } else if (loopMode === "all" && queue.length > 0) {
        // Loop to last song when at beginning and loop all is enabled
        await playIndex(queue.length - 1);
      } else {
        // no previous -> restart current song
        await player.seekTo(0);
      }
    } catch (err) {
      console.error("playPrevious error:", err);
    }
  }, [
    player,
    status?.currentTime,
    currentIndex,
    playIndex,
    loopMode,
    queue.length,
  ]);

  // Loop mode functions
  const toggleLoopMode = useCallback(() => {
    const modes: LoopMode[] = ["none", "one", "all"];
    const currentModeIndex = modes.indexOf(loopMode);
    const nextModeIndex = (currentModeIndex + 1) % modes.length;
    setLoopMode(modes[nextModeIndex]);
  }, [loopMode]);

  // Optimize auto-advance logic - reduce frequency of checks
  const lastProcessedTime = useRef(0);

  useEffect(() => {
    const currentTime = status?.currentTime ?? 0;
    const duration = status?.duration ?? 0;
    const isPlaying = !!status?.playing;

    if (duration > 0) {
      // Only process if time has changed significantly (reduce unnecessary runs)
      if (
        Math.abs(currentTime - lastProcessedTime.current) < 0.5 &&
        isPlaying
      ) {
        return;
      }
      lastProcessedTime.current = currentTime;

      // ✅ Check if the playback is almost at the end
      const nearEnd = currentTime >= Math.max(0, duration - 0.6); // 600ms tolerance

      // 👉 If playback is stopped AND song is basically over AND we haven't marked it finished before
      if (!isPlaying && nearEnd && !finishedRef.current) {
        finishedRef.current = true; // mark as finished (to prevent multiple triggers)

        // Handle different loop modes
        if (loopMode === "one") {
          // Replay the same song
          playIndex(currentIndex).catch((e) =>
            console.warn("loop one failed", e)
          );
        } else if (loopMode === "all") {
          // Move to next song, or loop back to start
          if (currentIndex >= 0 && currentIndex < queue.length - 1) {
            playNext().catch((e) => console.warn("auto playNext failed", e));
          } else if (queue.length > 0) {
            playIndex(0).catch((e) => console.warn("loop to start failed", e));
          }
        } else {
          // loopMode === 'none': move to next song if available
          if (currentIndex >= 0 && currentIndex < queue.length - 1) {
            playNext().catch((e) => console.warn("auto playNext failed", e));
          } else if (currentIndex === queue.length - 1) {
            playIndex(0).catch((e) =>
              console.warn("not starting from again", e)
            );
          }
        }
      }

      // ✅ Reset "finished" flag if playback starts again
      if (isPlaying) {
        finishedRef.current = false;
      }
    }
  }, [
    status?.currentTime,
    status?.duration,
    status?.playing,
    currentIndex,
    queue.length,
    loopMode,
    playNext,
    playIndex,
  ]);

  // Memoize the context value properly
  const value = useMemo(
    () => ({
      currentSong,
      isPlaying: !!status?.playing,
      position: status?.currentTime ?? 0,
      duration: status?.duration ?? 0,
      loopMode,
      playSong,
      togglePlayPause,
      seekTo,
      playNext,
      playPrevious,
      setLoopMode,
      toggleLoopMode,
    }),
    [
      currentSong,
      status?.playing,
      status?.currentTime,
      status?.duration,
      loopMode,

      playSong,
      togglePlayPause,
      seekTo,
      playNext,
      playPrevious,
      // setLoopMode is just setState, no need to memoize
      toggleLoopMode,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

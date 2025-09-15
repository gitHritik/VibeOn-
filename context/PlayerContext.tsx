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

export type Song = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
};

type PlayerContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number; // seconds
  duration: number; // seconds
  playSong: (song: Song, list?: Song[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
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

  // Next / Previous
  const playNext = useCallback(async () => {
    try {
      if (currentIndex >= 0 && currentIndex < queue.length - 1) {
        await playIndex(currentIndex + 1);
      } else {
        // optional: stop or restart queue; here we just stop
        // await player.stop?.(); // if you want to stop explicitly
      }
    } catch (err) {
      console.error("playNext error:", err);
    }
  }, [currentIndex, queue, playIndex]);

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
      } else {
        // no previous -> restart
        await player.seekTo(0);
      }
    } catch (err) {
      console.error("playPrevious error:", err);
    }
  }, [player, status?.currentTime, currentIndex, playIndex]);

  // Auto-advance when a track finishes (simple heuristic)
  useEffect(() => {
    const currentTime = status?.currentTime ?? 0;
    const duration = status?.duration ?? 0;
    const isPlaying = !!status?.playing;

    if (duration > 0) {
      // ✅ Check if the playback is almost at the end
      const nearEnd = currentTime >= Math.max(0, duration - 0.6); // 600ms tolerance

      // 👉 If playback is stopped AND song is basically over AND we haven't marked it finished before
      if (!isPlaying && nearEnd && !finishedRef.current) {
        finishedRef.current = true; // mark as finished (to prevent multiple triggers)

        // 🔥 Move to next song automatically
        if (currentIndex >= 0 && currentIndex < queue.length - 1) {
          playNext().catch((e) => console.warn("auto playNext failed", e));
        }
      }

      // ✅ Reset "finished" flag if playback starts again
      if (isPlaying) {
        finishedRef.current = false;
      }
    }
  }, [
    status?.currentTime, // re-run when playback time changes
    status?.duration, // re-run if duration updates
    status?.playing, // re-run when play/pause changes
    currentIndex, // re-run if we move in queue
    queue.length, // re-run if queue size changes
    playNext, // dependency to trigger next song
  ]);

  // value provided to consumers
  const value = useMemo(
    () => ({
      currentSong,
      isPlaying: !!status?.playing,
      position: status?.currentTime ?? 0,
      duration: status?.duration ?? 0,
      playSong,
      togglePlayPause,
      seekTo,
      playNext,
      playPrevious,
    }),
    [
      currentSong,
      status?.playing,
      status?.currentTime,
      status?.duration,
      playSong,
      togglePlayPause,
      seekTo,
      playNext,
      playPrevious,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

type PlayListContextType = {
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<Playlist>;
  addToPlaylist: (playlistId: string, song: Song) => Promise<boolean>;
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  getPlaylistById: (playlistId: string) => Playlist | null;
};

const PlayListContext = createContext<PlayListContextType | undefined>(
  undefined
);

export const usePlayList = () => {
  const clrx = useContext(PlayListContext);
  if (!clrx) {
    throw new Error("Used outside the playistContext");
  }
  return clrx;
};

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "1",
    name: "My Favorites",
    songs: [],
    createdAt: new Date("2024-01-01"), // Static date
  },
  {
    id: "2",
    name: "Recently Added",
    songs: [],
    createdAt: new Date("2024-01-01"), // Static date
  },
];

export const PlayListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const storedPlaylists = await AsyncStorage.getItem("playlists");
        if (storedPlaylists) {
          const parsed = JSON.parse(storedPlaylists);

          const withDates: Playlist[] = parsed.map((pl: Playlist) => ({
            ...pl,
            createdAt: new Date(pl.createdAt),
          }));

          setPlaylists(withDates);
        }
      } catch (error) {
        console.error("Failed to load playlists from storage:", error);
      }
    };
    loadPlaylists();
  }, []);

  useEffect(() => {
    const savePlaylists = async () => {
      try {
        await AsyncStorage.setItem("playlists", JSON.stringify(playlists));
      } catch (error) {
        console.error("Failed to load playlists from storage:", error);
      }
    };

    savePlaylists();
  }, [playlists]);

  //first create playlist
  const createPlaylist = useCallback(
    async (name: string): Promise<Playlist> => {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name,
        songs: [],
        createdAt: new Date(),
      };

      setPlaylists((prev) => [...prev, newPlaylist]);
      return newPlaylist;
    },
    []
  );

  //add song in playsit

  const addToPlaylist = useCallback(
    async (playlistsId: string, song: Song): Promise<boolean> => {
      try {
        setPlaylists((prev) =>
          prev.map((playlist) => {
            if (playlist.id === playlistsId) {
              // Check if song already exists in playlist
              const songExists = playlist.songs.some((s) => s.id === song.id);
              if (songExists) {
                return playlist; // Don't add duplicate
              }
              return {
                ...playlist,
                songs: [...playlist.songs, song],
              };
            }
            return playlist;
          })
        );
        return true;
      } catch (error) {
        console.error("Error adding to playlist:", error);
        return false;
      }
    },
    []
  );

  const removeFromPlaylist = useCallback(
    async (playlistsId: string, songId: string): Promise<boolean> => {
      try {
        setPlaylists((prev) =>
          prev.map((playlist) => {
            if (playlist.id === playlistsId) {
              return {
                ...playlist,
                song: playlist.songs.filter((song) => song.id === songId),
              };
            }
            return playlist;
          })
        );

        return true;
      } catch (error) {
        console.error("Error removing from playlist:", error);
        return false;
      }
    },
    []
  );

  const deletePlaylist = useCallback(
    async (playlistsId: string): Promise<boolean> => {
      try {
        setPlaylists((prev) => {
          const updated = prev.filter(
            (playlist) => playlist.id !== playlistsId
          );
          AsyncStorage.setItem("playlists", JSON.stringify(updated));
          return updated;
        });

        return true;
      } catch (error) {
        console.error("Error removing from playlist:", error);
        return false;
      }
    },
    []
  );

  const getPlaylistById = useCallback(
    (playlistsId: string): Playlist | null => {
      return playlists.find((playlist) => playlist.id === playlistsId) || null;
    },
    [playlists]
  );

  const value = useMemo(
    () => ({
      playlists,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      getPlaylistById,
    }),
    [
      playlists,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      getPlaylistById,
    ]
  );

  return (
    <PlayListContext.Provider value={value}>
      {children}
    </PlayListContext.Provider>
  );
};

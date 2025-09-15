import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

interface FavouriteContextType {
  favouriteSongs: Song[];
  toggleFavourite: (song: Song) => void;
}

const FavouriteContext = createContext<FavouriteContextType | null>(null);

export const FavouriteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favouriteSongs, setFavouriteSongs] = useState<Song[]>([]);

  // Load favourites from storage when app starts
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const stored = await AsyncStorage.getItem("favourites");
        if (stored) {
          setFavouriteSongs(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Error loading favourites:", err);
      }
    };
    loadFavourites();
  }, []);

  // Save favourites whenever they change
  useEffect(() => {
    const saveFavourites = async () => {
      try {
        await AsyncStorage.setItem(
          "favourites",
          JSON.stringify(favouriteSongs)
        );
      } catch (err) {
        console.error("Error saving favourites:", err);
      }
    };
    saveFavourites();
  }, [favouriteSongs]);

  const toggleFavourite = (song: Song) => {
    setFavouriteSongs(
      (prev) =>
        prev.find((s) => s.id === song.id)
          ? prev.filter((s) => s.id !== song.id) // remove
          : [...prev, song] // add
    );
  };

  return (
    <FavouriteContext.Provider value={{ favouriteSongs, toggleFavourite }}>
      {children}
    </FavouriteContext.Provider>
  );
};

export const useFavourites = () => {
  const ctx = useContext(FavouriteContext);
  if (!ctx)
    throw new Error("useFavourites must be used inside FavouriteProvider");
  return ctx;
};

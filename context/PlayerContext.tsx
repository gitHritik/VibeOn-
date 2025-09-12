// contexts/PlayerContext.tsx
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  uri: string;
}

interface PlayerContextProps {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

//Creating a simple method to use usecontext
//const {} = usePlayer(); rather then useContext(contextName);
export const usePlayer = () => {
  const nothing = useContext(PlayerContext);
  if (!nothing) {
    throw new Error("You have used useplayer outside");
  }
  return nothing;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //current song to store the data of songs
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  // Use the audio player hook with the current song URI
  const player = useAudioPlayer(currentSong?.uri ?? undefined);

  //provides all kind of things are like playing or not duartion and etc..
  const status = useAudioPlayerStatus(player);
  const isPlaying = status?.playing ?? false;

  //here we are just geeting song and saving it
  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  // Play the song when currentSong changes
  useEffect(() => {
    if (player && currentSong) {
      player.play();
    }
  }, [player, currentSong]);

  //this to chagne the play to pause or pause to play
  const togglePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    //simple returing evering as a context
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, playSong, togglePlayPause }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

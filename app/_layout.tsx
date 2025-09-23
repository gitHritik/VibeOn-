import { PlayerProvider } from "@/context/PlayerContext";
import { PlayListProvider } from "@/context/PlayListContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavouriteProvider } from "./../context/FavouriteContext";

export default function RootLayout() {
  return (
    <PlayListProvider>
      <FavouriteProvider>
        <PlayerProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="playlist/[playlistId]"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </PlayerProvider>
      </FavouriteProvider>
    </PlayListProvider>
  );
}

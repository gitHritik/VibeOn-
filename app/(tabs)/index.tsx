import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddedMusic from "../../components/AddedMusic";
import Searchbar from "./../../components/Searchbar";
import SmallPlayer from "./../../components/SmallPlayer";

const songs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    thumbnail:
      "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/saiyaara-et00447951-1752737895.jpg",
  },
  {
    id: "2",
    title: "Shape of You",
    artist: "Ed Sheeran",
    thumbnail:
      "https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/saiyaara-et00447951-1752737895.jpg",
  },
];

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <Searchbar />
      {songs.length > 0 ? (
        <AddedMusic songs={songs} />
      ) : (
        <>
          <Text style={styles.title}>🎵 Music</Text>
          <Text style={styles.subtitle}>
            No songs yet. Add music from your local storage to start vibing 🎶
          </Text>

          {/* Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && {
                backgroundColor: "#e64520",
                transform: [{ scale: 0.97 }],
              },
            ]}
            onPress={() => console.log("Add Music pressed!")}
          >
            <Text style={styles.buttonText}>+ Add Music</Text>
          </Pressable>
        </>
      )}

      <SmallPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4C29",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF4C29",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

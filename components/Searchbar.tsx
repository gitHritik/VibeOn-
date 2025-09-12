import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface SearchbarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function Searchbar({ value, onChangeText }: SearchbarProps) {
  return (
    <View style={styles.container}>
      {/* Search Icon */}
      <Ionicons name="search" size={20} color="#aaa" style={styles.icon} />

      {/* Input */}
      <TextInput
        placeholder="Search songs, artists..."
        placeholderTextColor="#aaa"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
});

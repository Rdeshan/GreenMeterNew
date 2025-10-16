import React from "react";
import { TextInput, StyleSheet, View } from "react-native";

interface SearchBarProps {
  search: string;
  setSearch: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#8aa39b"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  searchBar: {
    width: 350,
    maxWidth: 700,
    height: 44,
    marginTop:10,
    borderWidth: 1.5,
    borderColor: "#2d6a4f",
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default SearchBar;

import { View, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface BackArrowProps {
  style?: StyleProp<ViewStyle>; // ✅ allow passing style
}

const BackArrow = ({ style }: BackArrowProps) => {
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[{ padding: 10 }, style]} // ✅ merge internal + external styles
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
  );
};

export default BackArrow;

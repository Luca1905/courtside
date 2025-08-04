import { AppleMaps, GoogleMaps } from "expo-maps";
import { Platform, StyleSheet, Text } from "react-native";

export default function App() {
  if (Platform.OS === "ios") {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === "android") {
    return <GoogleMaps.View style={StyleSheet.absoluteFill} />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

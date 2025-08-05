import { AppleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useCurrentLocation } from "~/hooks/useCurrentLocation";

export default function Map() {
  const { location, error, isLoading } = useCurrentLocation();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  error && console.log(error);

  switch (Platform.OS) {
    case "ios":
      return (
        <>
          <AppleMaps.View
            style={StyleSheet.absoluteFill}
            cameraPosition={{ coordinates: location?.coords, zoom: 15 }}
            onCameraMove={({ coordinates }) => {
              console.log(coordinates);
            }}
            properties={{
              isMyLocationEnabled: true,
              isTrafficEnabled: false,
              selectionEnabled: true,
              mapType: AppleMapsMapType.HYBRID,
            }}
            uiSettings={{
              scaleBarEnabled: true,
              myLocationButtonEnabled: true,
              compassEnabled: true,
              togglePitchEnabled: false,
            }}
          />
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            className="justify-center items-center"
          >
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: "#FF0000",
                borderRadius: 15,
                borderWidth: 3,
                borderColor: "#FFFFFF",
                elevation: 5,
              }}
            />
          </View>
        </>
      );
    default:
      return <Text>Maps are only available on iOS</Text>;
  }
}

import { AppleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { Platform, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function Map() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  errorMsg && console.log(errorMsg);

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
                width: 30,
                height: 30,
                backgroundColor: "#FF0000",
                borderRadius: 15,
                borderWidth: 3,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            />
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: "transparent",
                borderStyle: "solid",
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderBottomWidth: 15,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderBottomColor: "#FF0000",
                transform: [{ rotate: "180deg" }],
                marginTop: -3,
              }}
            />
          </View>
        </>
      );
    default:
      return <Text>Maps are only available on iOS</Text>;
  }
}

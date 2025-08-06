import "~/styles/global.css";

import type { Theme } from "@react-navigation/native";
import {
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { PortalHost } from "@rn-primitives/portal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerBackTitle: "Back",
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={({ route }) => {
                // if no tab is focused yet, default to index
                const focused = getFocusedRouteNameFromRoute(route) || "index";

                switch (focused) {
                  case "index":
                    return {
                      headerShown: true,
                      headerTitle: "Matches",
                      headerRight: () => (
                        <Link href="/match/add/">
                          <MaterialCommunityIcons
                            name="plus-box-multiple"
                            size={24}
                            color={isDarkColorScheme ? "white" : "black"}
                          />
                        </Link>
                      ),
                    };
                  case "players":
                    return {
                      headerShown: true,
                      headerTitle: "Players",
                      headerRight: () => (
                        <Link href="/player/add/">
                          <MaterialCommunityIcons
                            name="plus-box-multiple"
                            size={24}
                            color={isDarkColorScheme ? "white" : "black"}
                          />
                        </Link>
                      ),
                    };
                  case "map":
                    return {
                      headerShown: false,
                    };
                  default:
                    return {};
                }
              }}
            />
            <Stack.Screen name="+not-found" />

            <Stack.Screen
              name="match/[id]"
              options={{
                headerShown: true,
                headerTitle: "Match Details",
                headerRight: () => (
                  <Link href="/match/add/">
                    <MaterialCommunityIcons
                      name="plus-box-multiple"
                      size={24}
                      color={isDarkColorScheme ? "white" : "black"}
                    />
                  </Link>
                ),
              }}
            />
            <Stack.Screen
              name="player/[id]"
              options={{
                headerShown: true,
                headerTitle: "Player Details",
                headerRight: () => (
                  <Link href="/match/add/">
                    <MaterialCommunityIcons
                      name="plus-box-multiple"
                      size={24}
                      color={isDarkColorScheme ? "white" : "black"}
                    />
                  </Link>
                ),
              }}
            />
            <Stack.Screen
              name="match/add/index"
              options={{
                title: "Add Match",
                headerShown: true,
                headerBackVisible: true,
                presentation: "card",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="player/add/index"
              options={{
                title: "Add Player",
                headerBackVisible: true,
                headerShown: true,
                presentation: "card",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
              }}
            />
            {
              // Native modal
              // <Stack.Screen
              //   name="native_modal"
              //   options={{
              //     presentation: "formSheet",
              //     gestureDirection: "vertical",
              //     animation: "slide_from_bottom",
              //     sheetGrabberVisible: true,
              //     sheetInitialDetentIndex: 0,
              //     sheetAllowedDetents: [0.5, 0.75, 1],
              //     sheetCornerRadius: 20,
              //     sheetExpandsWhenScrolledToEdge: true,
              //     sheetElevation: 24,
              //   }}
              // />
            }
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}

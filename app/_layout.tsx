import "~/styles/global.css";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Theme } from "@react-navigation/native";
import {
  DarkTheme,
  DefaultTheme,
  getFocusedRouteNameFromRoute,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { Link, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useQuickActions } from "~/hooks/useQuickActions";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

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
  useQuickActions();
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ConvexAuthProvider
      client={convex}
      storage={
        Platform.OS === "android" || Platform.OS === "ios"
          ? secureStorage
          : undefined
      }
    >
      <GestureHandlerRootView>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <RootNavigator />
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ConvexAuthProvider>
  );
}

function RootNavigator() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const { isAuthenticated } = useConvexAuth();

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
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="(authenticated)/(tabs)"
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
          name="(authenticated)/match/[id]"
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
          name="(authenticated)/player/[id]"
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
          name="(authenticated)/match/add/index"
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
          name="(authenticated)/player/add/index"
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
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

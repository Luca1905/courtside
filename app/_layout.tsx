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
              headerTitle: "",
              headerBackTitle: "Back",
              headerRight: () => <Link href="/match/add">Add</Link>,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={({ route }) => {
                // if no tab is focused yet, default to index
                const focused = getFocusedRouteNameFromRoute(route) || "index";

                const titles: Record<string, string> = {
                  index: "Matches",
                  players: "Players",
                };

                return {
                  headerShown: true,
                  headerTitle: titles[focused] ?? "",
                };
              }}
            />
            <Stack.Screen name="+not-found" />
            <Stack.Screen
              name="match/[id]"
              options={{ headerShown: true, headerTitle: "Match Details" }}
            />
            <Stack.Screen
              name="player/[id]"
              options={{ headerShown: true, headerTitle: "Player Details" }}
            />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}

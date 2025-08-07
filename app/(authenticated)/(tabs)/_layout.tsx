import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

import React from "react";
import type { MaterialCommunityIconNames } from "~/lib/icons/definitions";

function getIconNameByRoute(route: string): MaterialCommunityIconNames {
  switch (route) {
    case "index":
      return "history";
    case "players":
      return "account-group";
    case "profile":
      return "account";
    default:
      return "progress-question";
  }
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2f95dc",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          return (
            <MaterialCommunityIcons
              name={getIconNameByRoute(route.name)}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Matches",
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

import { Tabs } from "expo-router";
import { ClockFading } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
        },
        tabBarActiveTintColor: "#ff0000",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Matches",
          tabBarIcon: ({ size, color }) => (
            <ClockFading size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

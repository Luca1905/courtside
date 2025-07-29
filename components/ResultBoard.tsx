import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function ResultBoard() {
  const [scores, setScores] = useState([
    { guest: 0, home: 0 },
    { guest: 0, home: 0 },
    { guest: 0, home: 0 },
  ]);
  const updateScore = (
    index: number,
    team: "guest" | "home",
    increment: boolean
  ) => {
    setScores((prev) =>
      prev.map((score, i) => {
        if (i === index) {
          const newValue = increment
            ? Math.min(10, score[team] + 1)
            : Math.max(0, score[team] - 1);
          return { ...score, [team]: newValue };
        }
        return score;
      })
    );
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-100 p-4">
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />

      <View className="relative">
        {/* Main Scoreboard Body */}
        <View className="relative w-80 rounded-xl bg-green-600 p-6 shadow-lg shadow-black/30 md:w-96 md:p-8">
          {/* Corner Screws */}
          <View className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-gray-500 bg-gray-400" />
          <View className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-gray-500 bg-gray-400" />
          <View className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border-2 border-gray-500 bg-gray-400" />
          <View className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-gray-500 bg-gray-400" />

          {/* Score Displays */}
          <View className="space-y-6">
            {scores.map((score, index) => (
              <View key={index} className="relative">
                {/* Score Display Panel */}
                <View className="rounded-xl border-2 border-gray-300 bg-gray-200 p-4">
                  <View className="flex-row items-center justify-between">
                    {/* Guest Score */}
                    <View className="items-center">
                      <TouchableOpacity
                        onPress={() => updateScore(index, "guest", true)}
                        className="min-w-[32px] items-center rounded-lg p-2 active:bg-gray-300"
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={12}
                          color="black"
                        />
                      </TouchableOpacity>
                      <Text className="text-5xl font-bold text-black md:text-6xl">
                        {score.guest}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateScore(index, "guest", false)}
                        className="min-w-[32px] items-center rounded-lg p-2 active:bg-gray-300"
                      >
                        <MaterialCommunityIcons
                          name="minus"
                          size={12}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Center Dots */}
                    <View className="items-center space-y-2">
                      <View className="h-3 w-3 rounded-full border border-green-600 bg-green-500" />
                      <View className="h-3 w-3 rounded-full border border-green-600 bg-green-500" />
                    </View>

                    {/* Home Score */}
                    <View className="items-center">
                      <TouchableOpacity
                        onPress={() => updateScore(index, "home", true)}
                        className="min-w-[32px] items-center rounded-lg p-2 active:bg-gray-300"
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={12}
                          color="black"
                        />
                      </TouchableOpacity>
                      <Text className="text-5xl font-bold text-black md:text-6xl">
                        {score.home}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateScore(index, "home", false)}
                        className="min-w-[32px] items-center rounded-lg p-2 active:bg-gray-300"
                      >
                        <MaterialCommunityIcons
                          name="minus"
                          size={12}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Side Screws */}
                <View className="absolute -left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-gray-400 bg-gray-300" />
                <View className="absolute -right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-gray-400 bg-gray-300" />
              </View>
            ))}

            {/* Gast Heim Labels */}
            <View className="mt-8 pt-4">
              <View className="flex-row justify-between px-4">
                <Text className="text-2xl font-bold tracking-widest text-white md:text-3xl">
                  Guest
                </Text>
                <Text className="text-2xl font-bold tracking-widest text-white md:text-3xl">
                  Home
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

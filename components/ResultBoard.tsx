import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "~/lib/utils";

const { width } = Dimensions.get("window");
const BOARD_WIDTH = Math.min(width * 0.9, 420);

type Score = {
  guest: number;
  home: number;
};

export function ResultBoard(props: { className?: string }) {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<Score[]>([
    { guest: 0, home: 0 },
    { guest: 0, home: 0 },
    { guest: 0, home: 0 },
  ]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const updateScore = useCallback(
    (index: number, team: "guest" | "home", increment: boolean) => {
      triggerHaptic();
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
    },
    [triggerHaptic]
  );

  const ScoreButton = ({
    onPress,
    icon,
  }: {
    onPress: () => void;
    icon: "plus" | "minus";
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="h-12 w-12 items-center justify-center rounded-lg bg-gray-300 active:bg-gray-400"
    >
      <MaterialCommunityIcons name={icon} size={18} color="black" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        paddingTop: insets.top,
      }}
      className={cn("items-center justify-center px-4", props.className)}
    >
      <View
        style={{ width: BOARD_WIDTH }}
        className="rounded-2xl bg-green-600 p-6 shadow-xl"
      >
        {scores.map((score, index) => (
          <Animated.View
            key={index}
            className="mb-4 rounded-xl bg-gray-200 p-5 shadow-inner"
          >
            <View className="flex-row">
              <View className="flex-1 flex-row items-center justify-start">
                <View className="mr-4 items-center gap-3">
                  <ScoreButton
                    onPress={() => updateScore(index, "guest", true)}
                    icon="plus"
                  />
                  <ScoreButton
                    onPress={() => updateScore(index, "guest", false)}
                    icon="minus"
                  />
                </View>
                <View className="min-w-[80px] items-center">
                  <Text className="text-6xl font-bold tabular-nums">
                    {score.guest}
                  </Text>
                </View>
              </View>

              <View
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-1"
                style={{
                  transform: [{ translateX: -4 }, { translateY: -8 }],
                }}
              >
                <View className="h-2 w-2 rounded-full bg-green-700" />
                <View className="h-2 w-2 rounded-full bg-green-700" />
              </View>

              <View className="flex-1 flex-row items-center justify-end">
                <View className="min-w-[80px] items-center">
                  <Text className="text-6xl font-bold tabular-nums">
                    {score.home}
                  </Text>
                </View>
                <View className="ml-4 items-center gap-3">
                  <ScoreButton
                    onPress={() => updateScore(index, "home", true)}
                    icon="plus"
                  />
                  <ScoreButton
                    onPress={() => updateScore(index, "home", false)}
                    icon="minus"
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        ))}

        <View className="flex-row justify-between px-24 pt-4">
          <Text className="text-xl font-bold text-white">Guest</Text>
          <Text className="text-xl font-bold text-white">Home</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

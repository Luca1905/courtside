import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { SafeAreaView, View, Pressable, ScrollView } from "react-native";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/badge";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { cn } from "~/lib/utils";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { MapPin } from "~/lib/icons/MapPin";
import { Thermometer } from "~/lib/icons/Thermometer";
import { Wind } from "~/lib/icons/Wind";
import { CloudRain } from "~/lib/icons/CloudRain";
import { Droplets } from "~/lib/icons/Droplets";
import { formatDate, formatDuration, formatTime } from "~/lib/match";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MatchScreenSkeleton from "~/components/MatchScreenSkeleton";

export default function MatchScreen() {
  const router = useRouter();
  const { id: matchId } = useLocalSearchParams();

  const match = useQuery(
    api.matches.getMatchWithOpponentById,
    typeof matchId === "string"
      ? {
          matchId: matchId as Id<"matches">,
        }
      : "skip"
  );

  // Loading state
  if (match === undefined) {
    return <MatchScreenSkeleton />;
  }

  // No match found
  if (match === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-500 mb-4">Match not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-green-600 px-4 py-2 rounded"
        >
          <Text className="text-white text-base">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: true,
        }}
      />

      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="p-4 pb-8"
        >
          <Card className="mb-4">
            <View className="p-4">
              {/* Win/Loss Banner */}
              <View
                className={cn(
                  "absolute top-0 left-0 right-0 h-1.5 rounded-t-lg",
                  match.score.won ? "bg-green-500" : "bg-red-500"
                )}
              />
              <View className="flex-row justify-between items-center">
                {/* Score Section */}
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-3xl font-black",
                      match.score.won ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {match.score.sets.join(" ")}
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-semibold mt-1",
                      match.score.won ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {match.score.won ? "Victory" : "Defeat"}
                  </Text>
                </View>
                {/* Surface Badge */}
                <Badge
                  className={cn(
                    "px-3 py-1.5 rounded-full flex-row items-center gap-1.5",
                    match.surface === "Hard" &&
                      "bg-[#3B82F6]/10 border border-[#3B82F6]/30",
                    match.surface === "Clay" &&
                      "bg-[#D97706]/10 border border-[#D97706]/30",
                    match.surface === "Grass" &&
                      "bg-[#15803D]/10 border border-[#15803D]/30"
                  )}
                >
                  {/* Icons */}
                  {match.surface === "Hard" && (
                    <MaterialCommunityIcons
                      name="grid"
                      size={12}
                      color="#3B82F6"
                    />
                  )}
                  {match.surface === "Clay" && (
                    <MaterialCommunityIcons
                      name="dots-grid"
                      size={12}
                      color="#D97706"
                    />
                  )}
                  {match.surface === "Grass" && (
                    <MaterialCommunityIcons
                      name="grass"
                      size={12}
                      color="#15803D"
                    />
                  )}
                  <Text
                    className={cn(
                      "text-xs font-medium",
                      match.surface === "Hard" && "text-[#3B82F6]",
                      match.surface === "Clay" && "text-[#D97706]",
                      match.surface === "Grass" && "text-[#15803D]"
                    )}
                  >
                    {match.surface}
                  </Text>
                </Badge>
              </View>
            </View>
          </Card>

          {/* Opponent */}
          <Card className="mb-4">
            <Text className="px-4 pt-4 pb-2 text-sm font-medium text-muted-foreground uppercase">
              Opponent
            </Text>
            <View className="items-center px-4 pb-4">
              <Text className="text-2xl font-extrabold text-foreground mb-1">
                {match.opponent.name}
              </Text>
              <Text className="text-base text-muted-foreground mb-2">
                {match.opponent.club}
              </Text>
              <Badge className="bg-muted px-2 py-0.5 rounded-lg">
                <Text className="text-2xs font-semibold text-muted-foreground">
                  Rating: {match.opponent.ranking}
                </Text>
              </Badge>
            </View>
          </Card>

          {/* Match Information */}
          <Card className="mb-4">
            <Text className="px-4 pt-4 pb-2 text-sm font-medium text-muted-foreground uppercase">
              Match Information
            </Text>
            <View className="flex-row flex-wrap px-4 pt-2 pb-4">
              {/* Date */}
              <View className="w-1/2 flex-row items-center mb-4">
                <Calendar size={16} className="text-muted-foreground mr-2" />
                <View>
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Date
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatDate(match.date)}
                  </Text>
                </View>
              </View>
              {/* Time */}
              <View className="w-1/2 flex-row items-center mb-4">
                <Clock size={16} className="text-muted-foreground mr-2" />
                <View>
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Time
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatTime(match.date)}
                  </Text>
                </View>
              </View>
              {/* Venue */}
              <View className="w-1/2 flex-row items-center mb-4">
                <MapPin size={16} className="text-muted-foreground mr-2" />
                <View>
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Venue
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {match.venue}
                  </Text>
                </View>
              </View>
              {/* Duration */}
              <View className="w-1/2 flex-row items-center mb-4">
                <Clock size={16} className="text-muted-foreground mr-2" />
                <View>
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Duration
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatDuration(match.duration)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Weather Conditions */}
          <Card className="mb-4">
            <Text className="px-4 pt-4 pb-2 text-sm font-medium text-muted-foreground uppercase">
              Weather Conditions
            </Text>
            <View className="flex-row flex-wrap px-4 pt-2 pb-4">
              <View className="w-1/2 items-center mb-4">
                <Thermometer size={16} className="text-orange-500 mb-1" />
                <Text className="text-2xs font-medium text-muted-foreground">
                  Temperature
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {match.weather.temperature}°C
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <Wind size={16} className="text-blue-500 mb-1" />
                <Text className="text-2xs font-medium text-muted-foreground">
                  Wind Speed
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {match.weather.windSpeed} km/h
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <CloudRain size={16} className="text-muted-foreground mb-1" />
                <Text className="text-2xs font-medium text-muted-foreground">
                  Precipitation
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {match.weather.precipitation}%
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <Droplets size={16} className="text-cyan-500 mb-1" />
                <Text className="text-2xs font-medium text-muted-foreground">
                  Humidity
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {match.weather.humidity}%
                </Text>
              </View>
            </View>
          </Card>

          {/* Match Statistics */}
          <Card className="mb-4">
            <Text className="px-4 pt-4 pb-2 text-sm font-medium text-muted-foreground uppercase">
              Match Statistics
            </Text>
            <View className="flex-row flex-wrap px-4 pt-2 pb-4">
              <View className="w-1/2 items-center mb-4">
                <Text className="text-2xs font-medium text-muted-foreground">
                  Aces
                </Text>
                <Text className="text-lg font-extrabold text-green-600 mt-1">
                  {match.stats.player.serve.aces.total}
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <Text className="text-2xs font-medium text-muted-foreground">
                  Double Faults
                </Text>
                <Text className="text-lg font-extrabold text-destructive mt-1">
                  {match.stats.player.serve.doubleFaults.total}
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <Text className="text-2xs font-medium text-muted-foreground">
                  1st Serve %
                </Text>
                <Text className="text-lg font-extrabold text-foreground mt-1">
                  {match.stats.player.serve.totalPoints.firstServe}%
                </Text>
              </View>
              <View className="w-1/2 items-center mb-4">
                <Text className="text-2xs font-medium text-muted-foreground">
                  Break Points
                </Text>
                <Text className="text-lg font-extrabold text-foreground mt-1">
                  {match.stats.player.overall.breakPoints.won}
                </Text>
              </View>
            </View>
          </Card>

          {/* Set-by-Set Score */}
          <Card className="mb-4">
            <Text className="px-4 pt-4 pb-2 text-sm font-medium text-muted-foreground uppercase">
              Set-by-Set Score
            </Text>
            <View className="flex-row space-x-3 px-4 pt-2 pb-4">
              {match.score.sets.map((set, idx) => (
                <View
                  key={idx}
                  className="flex-1 items-center bg-muted/40 rounded-2xl p-4"
                >
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Set {idx + 1}
                  </Text>
                  <Text className="text-lg font-extrabold text-foreground mt-1">
                    {set}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

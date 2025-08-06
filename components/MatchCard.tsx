import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { api } from "~/convex/_generated/api";
import type { MatchWithOpponentRecord } from "~/convex/matches";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { CloudRain } from "~/lib/icons/CloudRain";
import { Thermometer } from "~/lib/icons/Thermometer";
import { calculateMatchDuration, formatMatchScore } from "~/lib/match";
import { cn } from "~/lib/utils";
import { Badge } from "./ui/badge";

interface MatchCardProps {
  match: MatchWithOpponentRecord;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDuration = (min: number) =>
  `${Math.floor(min / 60) ? `${Math.floor(min / 60)}h ` : ""}${min % 60}m`;

export function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();

  const playerForUser = useQuery(api.players.getForCurrentUser);

  if (playerForUser === undefined) {
    return null;
  }

  if (playerForUser === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-500 mb-4">
          You are not authenticated
        </Text>
        <Pressable
          onPress={() => router.replace("/welcome")}
          className="bg-green-600 px-4 py-2 rounded"
        >
          <Text className="text-white text-base">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const playerTeam =
    playerForUser._id === match.players.guest ? "Guest" : "Home";
  const won = match.winner === playerTeam;

  return (
    <Pressable
      onPress={() => router.navigate(`/match/${match._id}`)}
      className="mx-3 my-2"
    >
      <Card className="overflow-hidden rounded-2xl bg-card shadow-md">
        {/* Win/Loss Banner */}
        <View
          className={cn(
            "absolute top-0 left-0 right-0 h-1.5",
            won ? "bg-green-500" : "bg-red-500"
          )}
        />

        <View className="pt-3">
          {/* Header: Date and Type */}
          <View className="flex-row justify-between items-start px-4 pb-3">
            <View className="flex-row items-center">
              <Calendar size={12} className="text-muted-foreground mr-1.5" />
              <Text className="text-xs font-medium text-muted-foreground">
                {formatDate(match.date)}
              </Text>
              <Separator orientation="vertical" className="mx-2 h-3" />
              <Text className="text-xs font-medium text-muted-foreground">
                {match.type}
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
              <MaterialCommunityIcons
                name={
                  match.surface === "Hard"
                    ? "grid"
                    : match.surface === "Clay"
                      ? "dots-grid"
                      : "grass"
                }
                size={12}
                color={
                  match.surface === "Hard"
                    ? "#3B82F6"
                    : match.surface === "Clay"
                      ? "#D97706"
                      : "#15803D"
                }
              />
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

          {/* Opponent Info and Score */}
          <View className="px-4 pb-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-xs font-medium text-muted-foreground mb-1">
                  OPPONENT
                </Text>
                <Text className="text-xl font-extrabold text-primary mb-1">
                  {match.opponent.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-muted-foreground">
                    {match.opponent.club}
                  </Text>
                  <Badge className="bg-muted px-2 py-0.5 rounded-lg">
                    <Text className="text-2xs font-semibold text-muted-foreground">
                      LK {match.opponent.ranking}
                    </Text>
                  </Badge>
                </View>
              </View>

              {/* Score Display */}
              <View>
                <Text
                  className={cn(
                    "text-3xl font-black",
                    won ? "text-green-700" : "text-red-700"
                  )}
                >
                  {formatMatchScore(match.sets, playerTeam)}
                </Text>
                <Text
                  className={cn(
                    "text-sm font-semibold mt-1",
                    won ? "text-green-600" : "text-red-600"
                  )}
                >
                  {won ? "Victory" : "Defeat"}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="border-t border-border/50 bg-muted/20 px-4 py-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Clock size={14} className="text-muted-foreground mr-2" />
                <View>
                  <Text className="text-2xs font-medium text-muted-foreground">
                    Duration
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatDuration(
                      calculateMatchDuration(match.startTime, match.endTime)
                    )}
                  </Text>
                </View>
              </View>

              {/* Weather Stats */}
              <View className="flex-row gap-6">
                <View className="flex-row items-center">
                  <Thermometer
                    size={14}
                    className="text-muted-foreground mr-2"
                  />
                  <View>
                    <Text className="text-2xs font-medium text-muted-foreground">
                      Temp
                    </Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {match.weather?.temperature
                        ? `${match.weather.temperature}°C`
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <CloudRain size={14} className="text-muted-foreground mr-2" />
                  <View>
                    <Text className="text-2xs font-medium text-muted-foreground">
                      Humidity
                    </Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {match.weather?.humidity
                        ? `${match.weather.humidity}%`
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MatchCard } from "~/components/MatchCard";
import PlayerScreenSkeleton from "~/components/PlayerScreenSkeleton";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { ArrowDown, ArrowUp } from "~/lib/icons/Arrow";
import type { MaterialCommunityIconNames } from "~/lib/icons/definitions";
import { cn } from "~/lib/utils";

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { id: playerId } = useLocalSearchParams();

  const userPlayer = useQuery(api.players.getForCurrentUser);
  const player = useQuery(
    api.players.getById,
    typeof playerId === "string"
      ? {
          playerId: playerId as Id<"players">,
        }
      : "skip"
  );

  const playerStats = useQuery(
    api.stats.getPlayerStats,
    typeof playerId === "string"
      ? {
          playerId: playerId as Id<"players">,
        }
      : "skip"
  );

  const matches = useQuery(
    api.matches.getMatchesAgainstPlayer,
    typeof playerId === "string"
      ? { playerId: playerId as Id<"players"> }
      : "skip"
  );

  // // TODO: Loading state
  if (
    player === undefined ||
    playerStats === undefined ||
    matches === undefined
  ) {
    return <PlayerScreenSkeleton />;
  }

  // No match found
  if (player === null || playerStats === null || matches === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-500 mb-4">player not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-green-600 px-4 py-2 rounded"
        >
          <Text className="text-white text-base">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const StatCard = ({
    title,
    value,
    trend,
    suffix = "",
  }: {
    title: string;
    value?: string | number;
    trend: number;
    suffix?: string;
  }) => {
    // decide color: green for >0, red for <0, gray for ===0
    const trendColor =
      trend > 0
        ? "text-green-500"
        : trend < 0
          ? "text-red-500"
          : "text-gray-500";

    // pick icon: up or down (we’ll render down in gray for zero)
    const TrendIcon = trend > 0 ? ArrowUp : ArrowDown;

    return (
      <Card className="flex-1 p-3">
        <Text className="text-xs font-medium text-muted-foreground mb-1">
          {title}
        </Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-foreground">
            {value ?? "--"}
            {suffix}
          </Text>
          <View className="flex-row items-center">
            <TrendIcon size={12} className={trendColor} />
            <Text className={cn("text-xs font-medium", trendColor)}>
              {Math.abs(trend).toFixed(1)}
              {suffix}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const PlayerInfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: MaterialCommunityIconNames;
    label: string;
    value: string | number | undefined;
  }) => (
    <View className="flex-row items-center gap-2">
      <MaterialCommunityIcons
        name={icon}
        size={20}
        className="text-muted-foreground"
      />
      <View>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-medium text-foreground">
          {value ?? "--"}
        </Text>
      </View>
    </View>
  );

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
          contentContainerClassName="p-2 pb-16"
        >
          <View className="p-4">
            {/* Player Profile Card */}
            <Card>
              {/* Header with Ranking */}
              <View className="bg-primary/10 p-4 border-b border-border">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-2xl font-bold text-foreground">
                      {player.name}
                    </Text>
                    <Text className="text-base text-muted-foreground mt-1">
                      {player.club}
                    </Text>
                  </View>
                  <Badge className="bg-primary px-3 py-1.5">
                    <Text className="text-lg font-bold text-primary-foreground">
                      LK {player.ranking}
                    </Text>
                  </Badge>
                </View>
              </View>

              {/* Player Details Grid */}
              <View className="p-4">
                <View className="flex-row flex-wrap gap-y-2">
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="hand-front-right"
                      label="Hitting Arm"
                      value={
                        player.hittingArm ? `${player.hittingArm}-handed` : "--"
                      }
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="tennis"
                      label="Backhand Grip"
                      value={player.backhandGrip}
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="calendar"
                      label="Playing Since"
                      value={player.playingSince}
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="cake"
                      label="Age"
                      value={
                        player.birthYear
                          ? `${new Date().getFullYear() - player.birthYear} years`
                          : undefined
                      }
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Stats Section */}
          <View className="px-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              Performance Stats
            </Text>
            <View className="flex-row gap-2 mb-3">
              <StatCard
                title="Aces per Match"
                value={playerStats.current.aces}
                trend={playerStats.trend.aces}
              />
              <StatCard
                title="Double Faults"
                value={playerStats.current.doubleFaults}
                trend={playerStats.trend.doubleFaults}
              />
            </View>
            <View className="flex-row gap-2 mb-6">
              <StatCard
                title="1st Serve %"
                value={playerStats.current.firstServePercentage}
                trend={playerStats.trend.firstServePercentage}
                suffix="%"
              />
              <StatCard
                title="1st Serve Won %"
                value={playerStats.current.firstServeWonPercentage}
                trend={playerStats.trend.firstServeWonPercentage}
                suffix="%"
              />
            </View>
          </View>

          {/* Stats Chart */}
          <View className="px-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Performance Trends
            </Text>
            <Card className="p-4">
              <LineChart
                data={{
                  labels: ["", "", "", "", ""],
                  datasets: [
                    {
                      data: playerStats.history.firstServeWonPercentage,
                      color: () => "#22c55e",
                    },
                  ],
                }}
                width={320}
                height={180}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </Card>
          </View>

          {/* Match History */}
          <View className="px-1 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Recent Matches
            </Text>
            {matches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

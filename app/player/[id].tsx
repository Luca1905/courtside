import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { MatchCard } from "~/components/MatchCard";
import { ArrowUp, ArrowDown } from "~/lib/icons/Arrow";
import { cn } from "~/lib/utils";
import { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import MatchScreenSkeleton from "~/components/MatchScreenSkeleton";
import { MaterialCommunityIconNames } from "~/lib/icons/definitions";
import { MatchWithOpponent } from "~/convex/matches";

// Mock data
const MOCK_PLAYER = {
  _id: "1",
  name: "Alexander Schmidt",
  club: "TC Blau-Weiß",
  ranking: 12,
  hittingArm: "Right",
  backhandGrip: "Two-handed",
  height: 185,
  weight: 80,
  birthYear: 1995,
  playingSince: 2005,
  stats: {
    current: {
      aces: 5.2,
      doubleFaults: 2.8,
      firstServePercentage: 62,
      firstServeWonPercentage: 71,
    },
    trend: {
      aces: +0.8,
      doubleFaults: -0.3,
      firstServePercentage: +2,
      firstServeWonPercentage: +1.5,
    },
    history: {
      aces: [4.2, 4.8, 5.0, 4.7, 5.2],
      doubleFaults: [3.1, 2.9, 3.0, 2.8, 2.8],
      firstServePercentage: [60, 61, 59, 63, 62],
      firstServeWonPercentage: [68, 70, 69, 72, 71],
    },
  },
};

const MOCK_MATCHES: MatchWithOpponent[] = [
  {
    _id: "j576y59vak7emqwfmj4m8fff4s7khrh8" as Id<"matches">,
    date: "2025-06-20",
    duration: 120,
    opponentId: "j970t3jjf27c1jnqd8hg5xw7dd7kh4st" as Id<"players">,
    opponent: {
      _id: "j970t3jjf27c1jnqd8hg5xw7dd7kh4st" as Id<"players">,
      backhandGrip: undefined,
      club: "TSC Paulo",
      hittingArm: undefined,
      name: "Paul Paulus",
      ranking: 15,
      _creationTime: 1752247435997.3381,
    },
    score: { sets: ["6-4", "3-6", "7-5"], won: true },
    statistics: {
      overall: {
        aces: 7,
        breakPoints: { count: 7, won: 4 },
        doubleFaults: 3,
        firstServes: { count: 65, won: 44 },
        netPoints: { count: 30, won: 21 },
        receivingPoints: { count: 83, won: 46 },
        secondServes: { count: 27, won: 14 },
        totalPoints: { count: 142, won: 84 },
        unforcedError: 18,
        winners: 52,
      },
      rally: {
        approachShots: {
          forcedErrors: { bh: 1, fh: 3 },
          unforcedErrors: { bh: 3, fh: 2 },
          winners: { bh: 2, fh: 5 },
        },
        dropShots: {
          forcedErrors: { bh: 0, fh: 0 },
          unforcedErrors: { bh: 0, fh: 1 },
          winners: { bh: 0, fh: 1 },
        },
        groundStrokes: {
          forcedErrors: { bh: 10, fh: 15 },
          unforcedErrors: { bh: 8, fh: 12 },
          winners: { bh: 20, fh: 30 },
        },
        lobs: {
          forcedErrors: { bh: 1, fh: 2 },
          unforcedErrors: { bh: 0, fh: 1 },
          winners: { bh: 1, fh: 3 },
        },
        overheadStroke: {
          forcedErrors: { bh: 0, fh: 1 },
          unforcedErrors: { bh: 1, fh: 0 },
          winners: { bh: 0, fh: 2 },
        },
        passingShot: {
          forcedErrors: { bh: 1, fh: 2 },
          unforcedErrors: { bh: 2, fh: 1 },
          winners: { bh: 3, fh: 4 },
        },
        volleys: {
          forcedErrors: { bh: 3, fh: 4 },
          unforcedErrors: { bh: 2, fh: 3 },
          winners: { bh: 8, fh: 10 },
        },
      },
      return: {
        returnPoints: {
          firstServe: 60,
          secondServe: 23,
          total: 83,
        },
        returnPointsWon: {
          firstServe: 30,
          secondServe: 16,
          total: 46,
        },
        returnUnforcedErrors: {
          firstServe: 8,
          secondServe: 6,
          total: 14,
        },
        returnWinners: {
          firstServe: 10,
          secondServe: 4,
          total: 14,
        },
      },
      serve: {
        aces: { firstServe: 7, secondServe: 0, total: 7 },
        doubleFaults: {
          firstServe: 1,
          secondServe: 2,
          total: 3,
        },
        serviceGames: 9,
        serviceWinners: {
          firstServe: 5,
          secondServe: 1,
          total: 6,
        },
        totalPoints: {
          firstServe: 65,
          secondServe: 27,
          total: 92,
        },
        totalPointsWon: {
          firstServe: 44,
          secondServe: 14,
          total: 58,
        },
      },
    },
    surface: "Grass",
    type: "Singles",
    venue: "Riverside Stadium",
    weather: {
      humidity: 58,
      precipitation: 0,
      temperature: 24,
      windSpeed: 12,
    },
    _creationTime: 1752249347496.0483,
  },
];

export default function PlayerDetailsPage() {
  const router = useRouter();
  const { id: playerId } = useLocalSearchParams();

  const player = useQuery(
    api.players.getById,
    typeof playerId === "string"
      ? {
          playerId: playerId as Id<"players">,
        }
      : "skip"
  );

  // TODO: Loading state
  if (player === undefined) {
    return <MatchScreenSkeleton />;
  }

  // No match found
  if (player === null) {
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
    value: string | number;
    trend: number;
    suffix?: string;
  }) => (
    <Card className="flex-1 p-3">
      <Text className="text-xs font-medium text-muted-foreground mb-1">
        {title}
      </Text>
      <View className="flex-row items-baseline gap-2">
        <Text className="text-2xl font-bold text-foreground">
          {value}
          {suffix}
        </Text>
        <View className="flex-row items-center">
          {trend > 0 ? (
            <ArrowUp size={12} className="text-green-500" />
          ) : (
            <ArrowDown size={12} className="text-red-500" />
          )}
          <Text
            className={cn(
              "text-xs font-medium",
              trend > 0 ? "text-green-500" : "text-red-500"
            )}
          >
            {Math.abs(trend).toFixed(1)}
            {suffix}
          </Text>
        </View>
      </View>
    </Card>
  );

  const PlayerInfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: MaterialCommunityIconNames;
    label: string;
    value: string | number;
  }) => (
    <View className="flex-row items-center gap-2">
      <MaterialCommunityIcons
        name={icon}
        size={20}
        className="text-muted-foreground"
      />
      <View>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-medium text-foreground">{value}</Text>
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
                      {MOCK_PLAYER.name}
                    </Text>
                    <Text className="text-base text-muted-foreground mt-1">
                      {MOCK_PLAYER.club}
                    </Text>
                  </View>
                  <Badge className="bg-primary px-3 py-1.5">
                    <Text className="text-lg font-bold text-primary-foreground">
                      LK {MOCK_PLAYER.ranking}
                    </Text>
                  </Badge>
                </View>
              </View>

              {/* Player Details Grid */}
              <View className="p-4">
                <View className="flex-row flex-wrap gap-y-4">
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="hand-front-right"
                      label="Hitting Arm"
                      value={`${MOCK_PLAYER.hittingArm}-handed`}
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="tennis"
                      label="Backhand Grip"
                      value={MOCK_PLAYER.backhandGrip}
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="calendar"
                      label="Playing Since"
                      value={MOCK_PLAYER.playingSince}
                    />
                  </View>
                  <View className="flex-1 min-w-[150]">
                    <PlayerInfoItem
                      icon="cake"
                      label="Age"
                      value={`${new Date().getFullYear() - MOCK_PLAYER.birthYear} years`}
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
                value={MOCK_PLAYER.stats.current.aces}
                trend={MOCK_PLAYER.stats.trend.aces}
              />
              <StatCard
                title="Double Faults"
                value={MOCK_PLAYER.stats.current.doubleFaults}
                trend={MOCK_PLAYER.stats.trend.doubleFaults}
              />
            </View>
            <View className="flex-row gap-2 mb-6">
              <StatCard
                title="1st Serve %"
                value={MOCK_PLAYER.stats.current.firstServePercentage}
                trend={MOCK_PLAYER.stats.trend.firstServePercentage}
                suffix="%"
              />
              <StatCard
                title="1st Serve Won %"
                value={MOCK_PLAYER.stats.current.firstServeWonPercentage}
                trend={MOCK_PLAYER.stats.trend.firstServeWonPercentage}
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
                      data: MOCK_PLAYER.stats.history.firstServeWonPercentage,
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
            {MOCK_MATCHES.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

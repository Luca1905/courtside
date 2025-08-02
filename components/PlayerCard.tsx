import { Pressable, View } from "react-native";
import type { Doc } from "~/convex/_generated/dataModel";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";
import { Trophy } from "~/lib/icons/Trophy";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

interface PlayerCardProps {
  player: Doc<"players">;
  matchResults?: { wins: number; losses: number };
}

export function PlayerCard({ player, matchResults }: PlayerCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(`/player/${player._id}`)}
      className="mx-3 my-2"
    >
      <Card className="overflow-hidden rounded-2xl bg-card shadow-md">
        {/* Ranking Banner */}
        <View className="absolute top-0 left-0 right-0 h-1.5 bg-accent" />

        <View className="pt-3">
          {/* Header with Club and Ranking */}
          <View className="px-4 pb-2 flex-row justify-between items-center">
            <Badge className="bg-muted/60 px-2 py-1 rounded-lg">
              <Text className="text-xs font-medium text-muted-foreground">
                {player.club}
              </Text>
            </Badge>
            <View className="flex-row items-center gap-1">
              <Trophy size={12} className="text-amber-500" />
              <Text className="text-sm font-bold text-primary">
                LK {player.ranking}
              </Text>
            </View>
          </View>

          {/* Player Name and Stats */}
          <View className="px-4 pb-4">
            <Text className="text-2xl font-bold text-primary mb-3">
              {player.name}
            </Text>

            <View className="flex-row justify-between">
              {/* Playing Style */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialCommunityIcons
                    name="hand-front-right"
                    size={16}
                    color="#64748b"
                  />
                  <Text className="text-sm text-muted-foreground">
                    {player.hittingArm === "Right"
                      ? "Right-handed"
                      : "Left-handed"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="tennis"
                    size={16}
                    color="#64748b"
                  />
                  <Text className="text-sm text-muted-foreground">
                    {player.backhandGrip} Backhand
                  </Text>
                </View>
              </View>

              {/* Match Statistics */}
              {matchResults && (
                <View className="flex-row gap-3">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600">
                      {matchResults.wins}
                    </Text>
                    <Text className="text-xs text-muted-foreground">Wins</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-red-600">
                      {matchResults.losses}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      Losses
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Win Rate Bar */}
          {matchResults && (
            <View className="h-1.5 flex-row">
              <View
                className="bg-green-500"
                style={{
                  flex: matchResults.wins,
                }}
              />
              <View
                className="bg-red-500"
                style={{
                  flex: matchResults.losses,
                }}
              />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

import { useQuery } from "convex/react";
import { Pressable, View } from "react-native";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { CloudRain } from "~/lib/icons/CloudRain";
import { Thermometer } from "~/lib/icons/Thermometer";
import { TrendingDown } from "~/lib/icons/TrendingDown";
import { Trophy } from "~/lib/icons/Trophy";
import { cn } from "~/lib/utils";
import { Badge } from "./ui/badge";

interface MatchCardProps {
  match: Doc<"matches">;
  onPress: () => void;
}

const surfaceColors: Record<string, string> = {
  Hard: "bg-blue-500",
  Clay: "bg-amber-500",
  Grass: "bg-green-500",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDuration = (min: number) =>
  `${Math.floor(min / 60) ? `${Math.floor(min / 60)}h ` : ""}${min % 60}m`;

export function MatchCard({ match, onPress }: MatchCardProps) {
  const opponent = useQuery(api.players.getById, {
    playerId: match.opponentId,
  });

  if (!opponent) return null;

  const won = match.score.won;

  return (
    <Pressable onPress={onPress} className="mx-3 my-2">
      <Card className="overflow-hidden rounded-2xl bg-card shadow-md">
        <View className="flex-row">
          {/* Side bar for win/loss */}
          <View
            className={cn("w-1.5", won ? "bg-green-600" : "bg-destructive")}
          />

          <View className="flex-1">
            {/* Header: Date, Type, and Result Badges */}
            <View className="flex-row justify-between items-start p-4 pb-3">
              <View className="flex-row items-center">
                <Calendar
                  size={12}
                  className="text-muted-foreground mr-1.5"
                />
                <Text className="text-xs font-medium text-muted-foreground">
                  {formatDate(match.date)}
                </Text>
                <Separator orientation="vertical" className="mx-2 h-3" />
                <Text className="text-xs font-medium text-muted-foreground">
                  {match.type}
                </Text>
              </View>

              {/* Result and Surface Badges */}
              <View className="flex-row items-center gap-2">
                <Badge
                  className={cn(
                    "flex-row items-center gap-1 px-2 py-1 rounded-full",
                    won ? "bg-green-500" : "bg-destructive",
                  )}
                >
                  {won ? (
                    <Trophy size={10} color="#fff" />
                  ) : (
                    <TrendingDown size={10} color="#fff" />
                  )}
                  <Text className="text-2xs font-bold text-white tracking-wide">
                    {won ? "WON" : "LOST"}
                  </Text>
                </Badge>
                <Badge
                  className={cn(
                    "px-2 py-1 rounded-full",
                    surfaceColors[match.surface] ?? "bg-muted",
                  )}
                >
                  <Text className="text-2xs font-bold text-white tracking-wide">
                    {match.surface}
                  </Text>
                </Badge>
              </View>
            </View>

            {/* Opponent Info and Score */}
            <View className="px-4 pb-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-4">
                  <Text className="text-xs font-medium text-muted-foreground mb-1">
                    OPPONENT
                  </Text>
                  <Text className="text-xl font-extrabold text-primary mb-1">
                    {opponent.name}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-muted-foreground">
                      {opponent.club}
                    </Text>
                    <Badge className="bg-muted px-2 py-0.5 rounded-lg">
                      <Text className="text-2xs font-semibold text-muted-foreground">
                        LK {opponent.ranking}
                      </Text>
                    </Badge>
                  </View>
                </View>

                {/* Score Display */}
                <View className="bg-muted/40 rounded-xl py-3 px-4 items-center min-w-[80px]">
                  <Text className="text-2xs font-semibold text-muted-foreground mb-1">
                    SCORE
                  </Text>
                  <Text className="text-lg font-extrabold text-primary tracking-wider">
                    {match.score.sets.join(" / ")}
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
                      {formatDuration(match.duration)}
                    </Text>
                  </View>
                </View>

                {/* Weather Stats */}
                <View className="flex-row gap-6">
                  {/* Temperature */}
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

                  {/* Humidity */}
                  <View className="flex-row items-center">
                    <CloudRain
                      size={14}
                      className="text-muted-foreground mr-2"
                    />
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
        </View>
      </Card>
    </Pressable>
  );
}

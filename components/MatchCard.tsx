import { Match } from "~/types/match";
//TODO: create icons in lib/icons
import { TrendingDown, Trophy, Clock } from "lucide-react-native";
import { Calendar } from "~/lib/icons/Calendar";
import { View } from "react-native";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface MatchCardProps {
  match: Match;
  matchType?: "Singles" | "Doubles";
}

export function MatchCard({ match, matchType = "Singles" }: MatchCardProps) {
  const getSurfaceStyles = (surface: string) => {
    switch (surface) {
      case "Hard":
        return "bg-blue-500";
      case "Clay":
        return "bg-amber-500";
      case "Grass":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="w-full mx-4 my-2">
      <CardHeader>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Calendar size={12} className="text-muted-foreground m-2" />
              <Text className="text-xs text-muted-foreground font-medium">
                {formatDate(match.date)}
              </Text>
              <Separator orientation="vertical" className="m-2" />
              <Text className="text-xs text-muted-foreground font-medium">
                {matchType}
              </Text>
            </View>
            <View
              className={cn(
                "flex-row items-center px-2.5 py-1.5 rounded-full self-start",
                match.score.won ? "bg-green-500" : "bg-destructive"
              )}
            >
              {match.score.won ? (
                <Trophy size={14} color="#ffffff" />
              ) : (
                <TrendingDown size={14} color="#ffffff" />
              )}
              <Text className="text-primary-foreground text-xs font-bold ml-1.5 tracking-wider">
                {match.score.won ? "Won" : "Lost"}
              </Text>
            </View>
          </View>
          <View
            className={cn(
              "px-2 py-1 rounded-lg",
              getSurfaceStyles(match.surface)
            )}
          >
            <Text className="text-primary-foreground text-xs font-bold tracking-wider">
              {match.surface}
            </Text>
          </View>
        </View>
      </CardHeader>

      <CardContent className="pt-0">
        <View className="mb-4">
          <View className="flex-row items-center mb-1.5">
            <Text className="text-xl font-bold text-primary flex-1">
              {match.opponent.name}
            </Text>
            <Text className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-xl ml-2">
              LK {match.opponent.ranking}
            </Text>
          </View>
          <Text className="text-sm text-muted-foreground font-medium">
            {match.opponent.club}
          </Text>
        </View>

        <View className="items-center py-3 bg-muted/50 rounded-xl">
          <Text className="text-xs text-muted-foreground font-semibold mb-1 tracking-wider">
            Score
          </Text>
          <Text className="text-lg font-extrabold text-primary tracking-wide">
            {match.score.sets.join("  ")}
          </Text>
        </View>
      </CardContent>

      <CardFooter className="pt-4 border-t border-border">
        <View className="flex-row justify-around w-full">
          <View className="items-center">
            <View className="flex-row items-center mb-1">
              <Clock size={12} className="text-muted-foreground mr-1" />
              <Text className="text-base font-bold text-primary">
                {formatDuration(match.duration)}
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground font-semibold tracking-wider">
              Duration
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-bold text-primary mb-0.5">
              {match.statistics.overall.aces}
            </Text>
            <Text className="text-xs text-muted-foreground font-semibold tracking-wider">
              Aces
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-bold text-primary mb-0.5">
              {match.statistics.overall.winners}
            </Text>
            <Text className="text-xs text-muted-foreground font-semibold tracking-wider">
              Winners
            </Text>
          </View>
        </View>
      </CardFooter>
    </Card>
  );
}

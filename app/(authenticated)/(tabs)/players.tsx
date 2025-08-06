import { useQuery } from "convex/react";
import { useState } from "react";
import { FlatList, RefreshControl, SafeAreaView, View } from "react-native";
import { PlayerCard } from "~/components/PlayerCard";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { api } from "~/convex/_generated/api";
import type { Doc } from "~/convex/_generated/dataModel";
import { Search } from "~/lib/icons/Search";

function PlayerListItem({ player }: { player: Doc<"players"> }) {
  const matchResults = useQuery(api.players.getResultForPlayer, {
    playerId: player._id,
  });

  return (
    <PlayerCard player={player} matchResults={matchResults ?? undefined} />
  );
}

export default function PlayersPage() {
  const players = useQuery(api.players.getAll);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  if (!players) return <View />;

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.club?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background mt-4">
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View className="px-3 mb-2">
            <View className="flex-row items-center gap-2">
              <View className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-[13px] top-[13px] text-muted-foreground"
                />
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="pl-10 bg-muted/50 h-10"
                />
              </View>

              <ThemeToggle />
            </View>
          </View>
        }
        renderItem={({ item }) => <PlayerListItem player={item} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-muted-foreground text-center">
              No players found matching your search.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

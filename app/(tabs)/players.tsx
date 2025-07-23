import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { PlayerCard } from "~/components/PlayerCard";
import { Doc } from "~/convex/_generated/dataModel";
import { useState } from "react";
import { RefreshControl, FlatList, View, SafeAreaView } from "react-native";
import { Search } from "~/lib/icons/Search";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

function PlayerListItem({ player }: { player: Doc<"players"> }) {
  const matchResults = useQuery(api.players.getResultForPlayer, {
    playerId: player._id,
  });

  return <PlayerCard player={player} matchResults={matchResults} />;
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-4 bg-background border-b-[1px] border-b-border">
        <Text className="text-3xl font-semibold text-foreground mb-1">
          Players
        </Text>
      </View>
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListHeaderComponent={
          <View className="px-3 mb-2">
            <View className="relative">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-muted-foreground"
              />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="pl-10 bg-muted/50"
              />
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

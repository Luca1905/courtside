import { SafeAreaView, View, FlatList, RefreshControl } from "react-native";
import { Text } from "~/components/ui/text";
import { MatchCard } from "~/components/MatchCard";
import { Input } from "~/components/ui/input";
import HomeScreenSkeleton from "~/components/HomeScreenSkeleton";
import { Search } from "~/lib/icons/Search";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

import { useState } from "react";

export default function HomeScreen() {
  const matchesWithOpponent = useQuery(api.matches.getAllWithOpponent);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Loading state
  if (matchesWithOpponent === undefined) {
    return <HomeScreenSkeleton />;
  }

  const filteredMatches = matchesWithOpponent.filter(
    (m) =>
      m.date.includes(searchQuery.toLowerCase()) ||
      m.surface.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-4 bg-background border-b-[1px] border-b-border">
        <Text className="text-3xl font-semibold text-foreground mb-1">
          Match History
        </Text>
      </View>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item._id}
        contentContainerClassName="pb-16"
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
        renderItem={({ item }) => <MatchCard match={item} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-muted-foreground text-center">
              No matches found.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

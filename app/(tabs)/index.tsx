import { View, FlatList, RefreshControl } from "react-native";
import { Text } from "~/components/ui/text";
import { MatchCard } from "~/components/MatchCard";
import { Input } from "~/components/ui/input";
import HomeScreenSkeleton from "~/components/HomeScreenSkeleton";
import { Search } from "~/lib/icons/Search";
import { ThemeToggle } from "~/components/ThemeToggle";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

import { useState } from "react";

export default function HomeScreen() {
  const matchesWithOpponent = useQuery(api.matches.getAllMatchesWithOpponent);
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

  // TODO
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View className="bg-background mt-4">
      <FlatList
        data={filteredMatches}
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
        renderItem={({ item }) => <MatchCard match={item} />}
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
    </View>
  );
}

import { SafeAreaView, View, FlatList, RefreshControl } from "react-native";
import { Text } from "~/components/ui/text";

import { MatchCard } from "~/components/MatchCard";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";

import HomeScreenSkeleton from "~/components/HomeScreenSkeleton";
import { useState } from "react";

export default function HomeScreen() {
  const matches = useQuery(api.matches.get);
  const [refreshing, setRefreshing] = useState(false);

  // Loading state
  if (matches === undefined) {
    return <HomeScreenSkeleton />;
  }

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
        data={matches}
        renderItem={({ item }) => <MatchCard match={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item._id}
        contentContainerClassName="pb-16"
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

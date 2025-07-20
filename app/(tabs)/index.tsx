import { SafeAreaView, View, FlatList } from 'react-native';
import { Text } from "~/components/ui/text";

import { MatchCard } from '~/components/MatchCard';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';

export default function HomeScreen() {
  const matches = useQuery(api.matches.get);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-4 bg-background border-b-[1px] border-b-border" >
        <Text className="text-3xl font-semibold text-foreground mb-1">Match History</Text>
      </View>

      <FlatList
        data={matches}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
        keyExtractor={(item) => item._id}
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

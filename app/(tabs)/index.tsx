import { SafeAreaView, View, FlatList } from 'react-native';
import { Text } from "~/components/ui/text";

import { mockMatches } from '~/data/mockMatches';
import { MatchCard } from '~/components/MatchCard';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-5 pb-4 bg-background border-b-[1px] border-b-border" >
        <Text className="text-3xl font-semibold text-foreground mb-1">Match History</Text>
      </View>

      <FlatList
        data={mockMatches}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
        keyExtractor={(item) => item.id}
        className="pt-2 pb-24"
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}


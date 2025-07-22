import { SafeAreaView, View, FlatList } from "react-native";
import { Card } from "~/components/ui/card";

export default function HomeScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header Skeleton */}
      <View className="px-5 pt-5 pb-4 bg-background border-b-[1px] border-b-border">
        <View className="h-8 w-48 bg-muted rounded mb-1" />
      </View>

      {/* Skeleton List */}
      <FlatList
        data={[...Array(3)]}
        keyExtractor={(_, idx) => `skeleton-${idx}`}
        renderItem={() => (
          <View className="mx-3 my-2">
            <Card className="overflow-hidden rounded-2xl bg-card shadow-md">
              {/* Win/Loss Banner */}
              <View className="absolute top-0 left-0 right-0 h-1.5 bg-muted" />
              <View className="pt-3">
                {/* Header row */}
                <View className="flex-row justify-between items-start px-4 pb-3">
                  <View className="flex-row items-center">
                    <View className="h-3 w-20 bg-muted rounded mr-2" />
                    <View className="h-3 w-12 bg-muted rounded" />
                  </View>
                  <View className="h-6 w-16 bg-muted rounded" />
                </View>

                {/* Opponent & Score */}
                <View className="px-4 pb-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                      <View className="h-4 w-20 bg-muted rounded mb-2" />
                      <View className="h-6 w-32 bg-muted rounded mb-2" />
                      <View className="h-4 w-24 bg-muted rounded" />
                    </View>
                    <View>
                      <View className="h-8 w-12 bg-muted rounded mb-1" />
                      <View className="h-4 w-20 bg-muted rounded" />
                    </View>
                  </View>
                </View>

                {/* Footer */}
                <View className="border-t border-border/50 bg-muted/20 px-4 py-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="h-4 w-4 bg-muted rounded mr-2" />
                      <View>
                        <View className="h-3 w-16 bg-muted rounded mb-1" />
                        <View className="h-4 w-24 bg-muted rounded" />
                      </View>
                    </View>
                    <View className="flex-row gap-6">
                      {[...Array(2)].map((_, i) => (
                        <View key={i} className="flex-row items-center">
                          <View className="h-4 w-4 bg-muted rounded mr-2" />
                          <View>
                            <View className="h-3 w-12 bg-muted rounded mb-1" />
                            <View className="h-4 w-16 bg-muted rounded" />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

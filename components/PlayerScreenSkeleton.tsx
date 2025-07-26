import { SafeAreaView, ScrollView, View } from "react-native";
import { Card } from "~/components/ui/card";

export default function PlayerScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-2 pb-16"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Skeleton */}
        <View className="p-4">
          <Card>
            <View className="bg-primary/10 p-4 border-b border-border">
              <View className="flex-row justify-between items-center">
                <View>
                  <View className="h-6 w-32 bg-muted rounded mb-2" />
                  <View className="h-4 w-24 bg-muted rounded" />
                </View>
                <View className="h-6 w-12 bg-muted rounded" />
              </View>
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap gap-y-4">
                {[...Array(4)].map((_, i) => (
                  <View
                    key={i}
                    className="flex-1 min-w-[150] flex-row items-center gap-2"
                  >
                    <View className="h-5 w-5 bg-muted rounded" />
                    <View className="flex-1">
                      <View className="h-3 w-16 bg-muted rounded mb-1" />
                      <View className="h-4 w-20 bg-muted rounded" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Stats Cards Skeleton */}
        <View className="px-4">
          <View className="h-6 w-36 bg-muted rounded mb-3" />

          <View className="flex-row gap-2 mb-3">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="flex-1 p-3">
                <View className="h-3 w-20 bg-muted rounded mb-2" />
                <View className="h-8 w-24 bg-muted rounded" />
              </Card>
            ))}
          </View>

          <View className="flex-row gap-2 mb-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="flex-1 p-3">
                <View className="h-3 w-24 bg-muted rounded mb-2" />
                <View className="h-8 w-28 bg-muted rounded" />
              </Card>
            ))}
          </View>
        </View>

        {/* Chart Skeleton */}
        <View className="px-4 mb-6">
          <View className="h-6 w-40 bg-muted rounded mb-3" />
          <Card className="p-4">
            <View className="h-40 w-full bg-muted rounded" />
          </Card>
        </View>

        {/* Recent Matches Skeleton */}
        <View className="px-4 mb-6">
          <View className="h-6 w-32 bg-muted rounded mb-3" />
          {[...Array(3)].map((_, i) => (
            <View key={i} className="mb-3">
              <Card className="p-4">
                <View className="h-4 w-24 bg-muted rounded mb-2" />
                <View className="h-4 w-32 bg-muted rounded mb-2" />
                <View className="h-3 w-20 bg-muted rounded" />
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

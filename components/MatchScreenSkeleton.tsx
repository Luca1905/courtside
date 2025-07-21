import { SafeAreaView, ScrollView, View } from "react-native";
import { Card } from "~/components/ui/card";

//TODO: create reusable component for each skeleton
export default function MatchScreenSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header Skeleton */}
      <View className="flex-row items-center px-4 py-3 bg-card border-b border-border">
        <View className="w-6 h-6 bg-muted rounded mr-4" />
        <View className="h-6 w-32 bg-muted rounded" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pb-8"
      >
        {/* Score Card Skeleton */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <View className="w-24 h-8 bg-muted rounded mb-2" />
                <View className="w-16 h-4 bg-muted rounded" />
              </View>
              <View className="w-20 h-8 bg-muted rounded" />
            </View>
          </View>
        </Card>

        {/* Opponent Card Skeleton */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="w-20 h-4 bg-muted rounded mb-4" />
            <View className="items-center">
              <View className="w-40 h-6 bg-muted rounded mb-2" />
              <View className="w-32 h-4 bg-muted rounded mb-2" />
              <View className="w-24 h-4 bg-muted rounded" />
            </View>
          </View>
        </Card>

        {/* Match Info Skeleton */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="w-32 h-4 bg-muted rounded mb-4" />
            <View className="flex-row flex-wrap">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="w-1/2 pr-4 mb-4">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 bg-muted rounded mr-2" />
                    <View>
                      <View className="w-16 h-3 bg-muted rounded mb-1" />
                      <View className="w-24 h-4 bg-muted rounded" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Weather Skeleton */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="w-36 h-4 bg-muted rounded mb-4" />
            <View className="flex-row flex-wrap">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="w-1/2 items-center mb-4">
                  <View className="w-4 h-4 bg-muted rounded mb-1" />
                  <View className="w-20 h-3 bg-muted rounded mb-1" />
                  <View className="w-12 h-4 bg-muted rounded" />
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Statistics Skeleton */}
        <Card className="mb-4">
          <View className="p-4">
            <View className="w-32 h-4 bg-muted rounded mb-4" />
            <View className="flex-row flex-wrap">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="w-1/2 items-center mb-4">
                  <View className="w-24 h-3 bg-muted rounded mb-1" />
                  <View className="w-8 h-6 bg-muted rounded" />
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Set Scores Skeleton */}
        <Card>
          <View className="p-4">
            <View className="w-32 h-4 bg-muted rounded mb-4" />
            <View className="flex-row space-x-3">
              {[...Array(3)].map((_, i) => (
                <View
                  key={i}
                  className="flex-1 items-center bg-muted/40 rounded-2xl p-4"
                >
                  <View className="w-12 h-3 bg-muted rounded mb-1" />
                  <View className="w-8 h-6 bg-muted rounded" />
                </View>
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

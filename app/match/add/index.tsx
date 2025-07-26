import { useState } from "react";
import { ScrollView, View, Alert, SafeAreaView } from "react-native";
import { Stack, router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { User } from "~/lib/icons/User";
import { Trophy } from "~/lib/icons/Trophy";
import { cn } from "~/lib/utils";
import { MaterialCommunityIconNames } from "~/lib/icons/definitions";

const MATCH_TYPES = ["Singles", "Doubles"];
const SURFACES = ["Hard", "Clay", "Grass"];

const MOCK_OPPONENTS = [
  { id: "1", name: "Marie Weber", club: "Tennis Club Berlin" },
  { id: "2", name: "Thomas Müller", club: "SV Tennis" },
  { id: "3", name: "Lisa Schmidt", club: "TC Blau-Weiß" },
];

export default function AddMatchPage() {
  const [formData, setFormData] = useState({
    opponentId: "",
    opponentName: "",
    date: new Date().toISOString().split("T")[0],
    duration: { hours: 1, minutes: 30 },
    type: "Singles",
    surface: "Hard",
    score: {
      won: true,
      sets: ["", ""],
    },
  });

  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSet = () => {
    if (formData.score.sets.length < 5) {
      setFormData((prev) => ({
        ...prev,
        score: {
          ...prev.score,
          sets: [...prev.score.sets, ""],
        },
      }));
    }
  };

  const removeSet = (index: number) => {
    if (formData.score.sets.length > 2) {
      setFormData((prev) => ({
        ...prev,
        score: {
          ...prev.score,
          sets: prev.score.sets.filter((_, i) => i !== index),
        },
      }));
    }
  };

  const updateSet = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      score: {
        ...prev.score,
        sets: prev.score.sets.map((set, i) => (i === index ? value : set)),
      },
    }));
  };

  const selectOpponent = (opponent: (typeof MOCK_OPPONENTS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      opponentId: opponent.id,
      opponentName: opponent.name,
    }));
    setShowOpponentPicker(false);
  };

  const validateForm = () => {
    if (!formData.opponentId) {
      Alert.alert("Error", "Please select an opponent");
      return false;
    }
    if (formData.score.sets.some((set) => !set.trim())) {
      Alert.alert("Error", "Please fill in all set scores");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Match added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add match. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const OptionButton = ({
    selected,
    onPress,
    children,
    icon,
  }: {
    selected: boolean;
    onPress: () => void;
    children: React.ReactNode;
    icon?: MaterialCommunityIconNames;
  }) => (
    <Button
      variant={selected ? "default" : "outline"}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-2 flex-1",
        selected && "bg-primary"
      )}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={selected ? "#fff" : "#64748b"}
        />
      )}
      <Text
        className={selected ? "text-primary-foreground" : "text-foreground"}
      >
        {children}
      </Text>
    </Button>
  );

  const SurfaceButton = ({
    surface,
  }: {
    surface: "Hard" | "Clay" | "Grass";
  }) => {
    const selected = formData.surface === surface;
    const colors = {
      Hard: { bg: "#3B82F6", lightBg: "#3B82F6/10", border: "#3B82F6/30" },
      Clay: { bg: "#D97706", lightBg: "#D97706/10", border: "#D97706/30" },
      Grass: { bg: "#15803D", lightBg: "#15803D/10", border: "#15803D/30" },
    };

    return (
      <Button
        variant="outline"
        onPress={() => setFormData((prev) => ({ ...prev, surface }))}
        className={cn(
          "flex-row items-center gap-2 flex-1 border",
          selected &&
            `bg-[${colors[surface].lightBg}] border-[${colors[surface].border}]`
        )}
        style={
          selected
            ? {
                backgroundColor: colors[surface].lightBg,
                borderColor: colors[surface].border,
              }
            : {}
        }
      >
        <MaterialCommunityIcons
          name={
            surface === "Hard"
              ? "grid"
              : surface === "Clay"
                ? "dots-grid"
                : "grass"
          }
          size={16}
          color={selected ? colors[surface].bg : "#64748b"}
        />
        <Text
          className={selected ? "font-medium" : "text-foreground"}
          style={selected ? { color: colors[surface].bg } : {}}
        >
          {surface}
        </Text>
      </Button>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4 gap-6">
          {/* Match Result */}
          <Card className="p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Trophy size={20} className="text-foreground" />
              <Text className="text-lg font-semibold text-foreground">
                Match Result
              </Text>
            </View>

            <View className="flex-row gap-2 mb-4">
              <Button
                variant={formData.score.won ? "default" : "outline"}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    score: { ...prev.score, won: true },
                  }))
                }
                className={cn("flex-1", formData.score.won && "bg-green-500")}
              >
                <Text
                  className={
                    formData.score.won ? "text-white" : "text-foreground"
                  }
                >
                  Victory
                </Text>
              </Button>
              <Button
                variant={!formData.score.won ? "default" : "outline"}
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    score: { ...prev.score, won: false },
                  }))
                }
                className={cn("flex-1", !formData.score.won && "bg-red-500")}
              >
                <Text
                  className={
                    !formData.score.won ? "text-white" : "text-foreground"
                  }
                >
                  Defeat
                </Text>
              </Button>
            </View>

            <Label className="text-sm font-medium mb-2">Set Scores</Label>
            <View className="gap-2">
              {formData.score.sets.map((set, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <Text className="text-sm font-medium text-muted-foreground w-8">
                    Set {index + 1}
                  </Text>
                  <Input
                    value={set}
                    onChangeText={(value) => updateSet(index, value)}
                    placeholder="6-4"
                    className="flex-1"
                  />
                  {formData.score.sets.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => removeSet(index)}
                    >
                      <Text className="text-destructive">×</Text>
                    </Button>
                  )}
                </View>
              ))}

              {formData.score.sets.length < 5 && (
                <Button variant="outline" onPress={addSet} className="mt-2">
                  <Text>+ Add Set</Text>
                </Button>
              )}
            </View>
          </Card>

          {/* Opponent Selection */}
          <Card className="p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <User size={20} className="text-foreground" />
              <Text className="text-lg font-semibold text-foreground">
                Opponent
              </Text>
            </View>

            {formData.opponentName ? (
              <View className="flex-row items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Text className="text-base font-medium text-foreground">
                  {formData.opponentName}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setShowOpponentPicker(true)}
                >
                  <Text>Change</Text>
                </Button>
              </View>
            ) : (
              <Button
                variant="outline"
                onPress={() => setShowOpponentPicker(true)}
                className="justify-start"
              >
                <Text>Select Opponent</Text>
              </Button>
            )}

            {showOpponentPicker && (
              <View className="mt-4 gap-2">
                <Text className="text-sm font-medium text-muted-foreground">
                  Choose opponent:
                </Text>
                {MOCK_OPPONENTS.map((opponent) => (
                  <Button
                    key={opponent.id}
                    variant="outline"
                    onPress={() => selectOpponent(opponent)}
                    className="justify-start p-3"
                  >
                    <View>
                      <Text className="font-medium">{opponent.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {opponent.club}
                      </Text>
                    </View>
                  </Button>
                ))}
              </View>
            )}
          </Card>

          {/* Match Details */}
          <Card className="p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Match Details
            </Text>

            <View className="gap-4">
              {/* Date */}
              <View>
                <Label className="text-sm font-medium mb-2 flex-row items-center">
                  <Calendar size={14} className="text-muted-foreground mr-1" />
                  Date
                </Label>
                <Input
                  value={formData.date}
                  onChangeText={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: value,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                />
              </View>

              {/* Duration */}
              <View>
                <Label className="text-sm font-medium mb-2 flex-row items-center">
                  <Clock size={14} className="text-muted-foreground mr-1" />
                  Duration
                </Label>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input
                      value={formData.duration.hours.toString()}
                      onChangeText={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: {
                            ...prev.duration,
                            hours: parseInt(value) || 0,
                          },
                        }))
                      }
                      placeholder="Hours"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      value={formData.duration.minutes.toString()}
                      onChangeText={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: {
                            ...prev.duration,
                            minutes: parseInt(value) || 0,
                          },
                        }))
                      }
                      placeholder="Minutes"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Match Type */}
              <View>
                <Label className="text-sm font-medium mb-2">Match Type</Label>
                <View className="flex-row gap-2">
                  {MATCH_TYPES.map((type) => (
                    <OptionButton
                      key={type}
                      selected={formData.type === type}
                      onPress={() => setFormData((prev) => ({ ...prev, type }))}
                    >
                      {type}
                    </OptionButton>
                  ))}
                </View>
              </View>

              {/* Court Surface */}
              <View>
                <Label className="text-sm font-medium mb-2">
                  Court Surface
                </Label>
                <View className="flex-row gap-2">
                  {SURFACES.map((surface) => (
                    <SurfaceButton key={surface} surface={surface} />
                  ))}
                </View>
              </View>
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="mt-4"
          >
            <Text className="text-primary-foreground font-semibold">
              {isSubmitting ? "Adding Match..." : "Add Match"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

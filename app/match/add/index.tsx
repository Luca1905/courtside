import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Alert,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { Stack, router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { User } from "~/lib/icons/User";
import { cn } from "~/lib/utils";
import { MaterialCommunityIconNames } from "~/lib/icons/definitions";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { validateMatch } from "~/lib/validator";
import DatePicker from "react-native-date-picker";
import { ResultBoard } from "~/components/ResultBoard";

const MATCH_TYPES = ["Singles", "Doubles"] as const;
const SURFACES = ["Hard", "Clay", "Grass"] as const;

const MOCK_OPPONENTS = [
  { id: "1", name: "Marie Weber", club: "Tennis Club Berlin" },
  { id: "2", name: "Thomas Müller", club: "SV Tennis" },
  { id: "3", name: "Lisa Schmidt", club: "TC Blau-Weiß" },
];

const setString = z
  .string()
  .trim()
  .regex(/^\d+-\d+$/, "Use X-Y (6-4, 7-6(8-6) …)");

const formSchema = z
  .object({
    opponentId: z.string().min(1, "Pick an opponent"),
    date: z.date(),
    startTime: z.date(),
    endTime: z.date(),
    type: z.enum(MATCH_TYPES),
    surface: z.enum(SURFACES),
    sets: z.array(setString).min(2).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }

    const bestOf = data.sets.length > 3 ? 5 : 3;
    const res = validateMatch(bestOf, data.sets);
    if (!res.valid) {
      res.errors.forEach((e) =>
        ctx.addIssue({
          code: "custom",
          path: ["sets"],
          message: e,
        })
      );
    }
  });

type FormData = z.infer<typeof formSchema>;

function useDuration(start: Date, end: Date) {
  const [label, setLabel] = useState("Invalid");

  useEffect(() => {
    if (end <= start) {
      setLabel("Invalid");
      return;
    }
    const min = Math.round((end.getTime() - start.getTime()) / 60000);
    const h = Math.floor(min / 60);
    const m = min % 60;
    setLabel(h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`);
  }, [start, end]);

  return label;
}

const SegmentBase = ({
  selected,
  onPress,
  children,
  icon,
  extraClass = "",
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  icon?: MaterialCommunityIconNames;
  extraClass?: string;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className={cn(
      "flex-1 flex-row items-center justify-center rounded-full px-3.5 py-2",
      selected ? "bg-primary shadow-md" : "border border-border bg-background",
      extraClass
    )}
  >
    {icon && (
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={selected ? "#fff" : "#64748b"}
        style={{ marginRight: 4 }}
      />
    )}
    <Text
      className={cn(
        "font-medium",
        selected ? "text-primary-foreground" : "text-foreground"
      )}
    >
      {children}
    </Text>
  </Pressable>
);

const SurfaceButton = ({
  surface,
  selected,
  onPress,
}: {
  surface: (typeof SURFACES)[number];
  selected: boolean;
  onPress: () => void;
}) => {
  const color = { Hard: "#3B82F6", Clay: "#D97706", Grass: "#15803D" }[surface];
  return (
    <SegmentBase
      selected={selected}
      onPress={onPress}
      icon={
        surface === "Hard" ? "grid" : surface === "Clay" ? "dots-grid" : "grass"
      }
      extraClass={selected ? "border-0" : ""}
    >
      <Text style={selected ? { color } : undefined}>{surface}</Text>
    </SegmentBase>
  );
};

export default function AddMatchPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponentId: "",
      date: new Date(),
      startTime: new Date(Date.now() + 120 * 60000), // 2 hours later,
      endTime: new Date(),
      type: "Singles",
      surface: undefined,
      sets: ["", ""],
    },
  });

  // Modal states
  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Watch form values for display and calculations
  const watchedValues = watch();
  const selectedOpponent = MOCK_OPPONENTS.find(
    (o) => o.id === watchedValues.opponentId
  );
  const durationLabel = useDuration(
    watchedValues.startTime,
    watchedValues.endTime
  );

  const selectOpponent = (opponent: (typeof MOCK_OPPONENTS)[0]) => {
    setValue("opponentId", opponent.id);
    setShowOpponentPicker(false);
    trigger("opponentId");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: Date) => date.toLocaleDateString();

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form data:", data);

      Alert.alert("Success", "Match added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to add match. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Add New Match" }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Board */}
        <ResultBoard className="p-6 rounded-2xl shadow-sm" />

        {/* Opponent Selection */}
        <Card className="p-6 rounded-2xl shadow-sm mt-6">
          <View className="flex-row items-center gap-3 mb-4">
            <User size={24} className="text-foreground" />
            <Text className="text-xl font-bold">Opponent</Text>
          </View>

          <Controller
            control={control}
            name="opponentId"
            render={() => (
              <>
                {selectedOpponent ? (
                  <View className="flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <View>
                      <Text className="text-lg font-medium">
                        {selectedOpponent.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {selectedOpponent.club}
                      </Text>
                    </View>
                    <Button
                      variant="ghost"
                      onPress={() => setShowOpponentPicker(true)}
                    >
                      <Text className="text-primary">Change</Text>
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
              </>
            )}
          />

          {errors.opponentId && (
            <Text className="text-destructive text-sm mt-2">
              {errors.opponentId.message}
            </Text>
          )}
        </Card>

        {/* Match Details */}
        <Card className="p-6 rounded-2xl shadow-sm mt-6">
          <View className="flex-row items-center gap-3 mb-4">
            <Clock size={24} className="text-foreground" />
            <Text className="text-xl font-bold">Match Details</Text>
          </View>

          {/* Date */}
          <View className="mb-6">
            <Label className="font-semibold mb-2 flex-row items-center gap-1">
              <Calendar size={16} className="text-muted-foreground" />
              Date
            </Label>

            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                >
                  <Text className="flex-1">{formatDate(field.value)}</Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#64748b"
                  />
                </Pressable>
              )}
            />

            {errors.date && (
              <Text className="text-destructive text-sm mt-1">
                {errors.date.message}
              </Text>
            )}
          </View>

          {/* Start and End Time */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Label className="font-semibold mb-2">Start Time</Label>
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <Pressable
                    onPress={() => setShowStartPicker(true)}
                    className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                  >
                    <Text className="flex-1">{formatTime(field.value)}</Text>
                    <MaterialCommunityIcons
                      name="clock"
                      size={20}
                      color="#64748b"
                    />
                  </Pressable>
                )}
              />
              {errors.startTime && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.startTime.message}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Label className="font-semibold mb-2">End Time</Label>
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <Pressable
                    onPress={() => setShowEndPicker(true)}
                    className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                  >
                    <Text className="flex-1">{formatTime(field.value)}</Text>
                    <MaterialCommunityIcons
                      name="clock"
                      size={20}
                      color="#64748b"
                    />
                  </Pressable>
                )}
              />
              {errors.endTime && (
                <Text className="text-destructive text-sm mt-1">
                  {errors.endTime.message}
                </Text>
              )}
            </View>
          </View>

          {/* Duration Display */}
          <View className="p-3 bg-muted/50 rounded-lg mb-6">
            <Text className="text-sm text-muted-foreground">
              Duration: {durationLabel}
            </Text>
          </View>

          {/* Match Type */}
          <View className="mb-6">
            <Label className="font-semibold mb-3">Match Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <View className="flex-row gap-3">
                  {MATCH_TYPES.map((type) => (
                    <SegmentBase
                      key={type}
                      selected={field.value === type}
                      onPress={() => field.onChange(type)}
                    >
                      {type}
                    </SegmentBase>
                  ))}
                </View>
              )}
            />
            {errors.type && (
              <Text className="text-destructive text-sm mt-2">
                {errors.type.message}
              </Text>
            )}
          </View>

          {/* Court Surface */}
          <View>
            <Label className="font-semibold mb-3">Court Surface</Label>
            <Controller
              control={control}
              name="surface"
              render={({ field }) => (
                <View className="flex-row gap-3">
                  {SURFACES.map((surface) => (
                    <SurfaceButton
                      key={surface}
                      surface={surface}
                      selected={field.value === surface}
                      onPress={() => field.onChange(surface)}
                    />
                  ))}
                </View>
              )}
            />
            {errors.surface && (
              <Text className="text-destructive text-sm mt-2">
                {errors.surface.message}
              </Text>
            )}
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-8 rounded-full shadow-md"
        >
          <Text className="text-primary-foreground font-bold">
            {isSubmitting ? "Adding…" : "Add Match"}
          </Text>
        </Button>
      </ScrollView>

      {/* Modals */}

      {/* Opponent Picker Modal */}
      <Modal visible={showOpponentPicker} animationType="slide">
        <SafeAreaView className="flex-1 bg-background">
          <View className="p-6">
            <Text className="text-xl font-bold mb-4">Select Opponent</Text>
            <ScrollView>
              {MOCK_OPPONENTS.map((opponent) => (
                <Pressable
                  key={opponent.id}
                  onPress={() => selectOpponent(opponent)}
                  className="p-4 mb-3 bg-muted/50 rounded-lg"
                >
                  <Text className="font-semibold text-lg">{opponent.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {opponent.club}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button
              variant="secondary"
              onPress={() => setShowOpponentPicker(false)}
              className="mt-4 rounded-full"
            >
              <Text>Cancel</Text>
            </Button>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      <DatePicker
        modal
        open={showDatePicker}
        date={watchedValues.date}
        mode="date"
        onConfirm={(selectedDate) => {
          setValue("date", selectedDate);
          setShowDatePicker(false);
          trigger("date");
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Start Time Picker */}
      <DatePicker
        modal
        open={showStartPicker}
        date={watchedValues.startTime}
        mode="time"
        onConfirm={(selectedTime) => {
          setValue("startTime", selectedTime);
          setShowStartPicker(false);
          trigger(["startTime", "endTime"]);
        }}
        onCancel={() => setShowStartPicker(false)}
      />

      {/* End Time Picker */}
      <DatePicker
        modal
        open={showEndPicker}
        date={watchedValues.endTime}
        mode="time"
        onConfirm={(selectedTime) => {
          setValue("endTime", selectedTime);
          setShowEndPicker(false);
          trigger(["startTime", "endTime"]);
        }}
        onCancel={() => setShowEndPicker(false)}
      />
    </SafeAreaView>
  );
}

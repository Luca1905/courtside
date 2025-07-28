import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Alert,
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { z } from "zod";
import {
  useForm,
  Controller,
  useFieldArray,
  UseFormTrigger,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const MATCH_TYPES = ["Singles", "Doubles"] as const;
const SURFACES = ["Hard", "Clay", "Grass"] as const;

const MOCK_OPPONENTS = [
  { id: "1", name: "Marie Weber", club: "Tennis Club Berlin" },
  { id: "2", name: "Thomas Müller", club: "SV Tennis" },
  { id: "3", name: "Lisa Schmidt", club: "TC Blau-Weiß" },
];

const setScoreSchema = z
  .string()
  .trim()
  .min(1, "Set score is required")
  .regex(/^\d+-\d+$/, "Invalid score format, use X-Y (e.g., 6-4)")
  .refine((val) => {
    const [player, opponent] = val.split("-").map(Number);
    return player !== opponent; // Ensure there's a winner for the set
  }, "Set must have a winner (scores can't be equal)");

const formSchema = z
  .object({
    opponentId: z.string().min(1, "Please select an opponent"),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    startTime: z.date(),
    endTime: z.date(),
    type: z.enum(MATCH_TYPES),
    surface: z.enum(SURFACES),
    sets: z
      .array(setScoreSchema)
      .min(2, "At least 2 sets required")
      .max(5, "Maximum 5 sets allowed"),
  })
  .superRefine((data, ctx) => {
    // Validate duration
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }

    // Validate sets completeness and infer winner
    let playerSetsWon = 0;
    let opponentSetsWon = 0;
    data.sets.forEach((set) => {
      const [player, opponent] = set.split("-").map(Number);
      if (player > opponent) playerSetsWon++;
      else opponentSetsWon++;
    });

    const totalSets = data.sets.length;
    const requiredWins = Math.floor(totalSets / 2) + 1; // Majority wins (e.g., 2 for best of 3, 3 for best of 5)

    if (playerSetsWon < requiredWins && opponentSetsWon < requiredWins) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Match is not complete - no player has won the required sets",
        path: ["sets"],
      });
    }

    if (playerSetsWon >= requiredWins && opponentSetsWon >= requiredWins) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid set wins - both players can't win the match",
        path: ["sets"],
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

export default function AddMatchPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponentId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 90 * 60000), // Default 1.5 hours later
      type: "Singles",
      surface: "Hard",
      sets: ["", ""],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sets",
  });

  const [opponentName, setOpponentName] = useState("");
  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(watch("date")));

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(watch("startTime"));

  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempEndTime, setTempEndTime] = useState(watch("endTime"));

  // Infer winner for display (not stored, just for UI)
  const [inferredWon, setInferredWon] = useState<boolean | null>(null);

  const watchedSets = watch("sets");

  useEffect(() => {
    // Infer winner whenever sets change
    let playerSetsWon = 0;
    let opponentSetsWon = 0;
    let isValid = true;

    watchedSets.forEach((set) => {
      if (set.match(/^\d+-\d+$/)) {
        const [player, opponent] = set.split("-").map(Number);
        if (player > opponent) playerSetsWon++;
        else if (player < opponent) opponentSetsWon++;
        else isValid = false;
      } else {
        isValid = false;
      }
    });

    const totalSets = watchedSets.length;
    const requiredWins = Math.floor(totalSets / 2) + 1;

    if (
      isValid &&
      (playerSetsWon >= requiredWins || opponentSetsWon >= requiredWins)
    ) {
      setInferredWon(playerSetsWon > opponentSetsWon);
    } else {
      setInferredWon(null);
    }
  }, [watchedSets]);

  const addSet = () => {
    if (fields.length < 5) {
      append("");
      trigger("sets");
    }
  };

  const removeSet = (index: number) => {
    if (fields.length > 2) {
      remove(index);
      trigger("sets");
    }
  };

  const selectOpponent = (opponent: (typeof MOCK_OPPONENTS)[0]) => {
    setValue("opponentId", opponent.id);
    setOpponentName(opponent.name);
    setShowOpponentPicker(false);
    trigger("opponentId");
  };

  // Date Picker handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        const currentDate = selectedDate || tempDate;
        setValue("date", currentDate.toISOString().split("T")[0]);
        trigger("date");
      }
      setShowDatePicker(false);
    } else {
      // iOS: update temp
      setTempDate(selectedDate || tempDate);
    }
  };

  const confirmDate = () => {
    setValue("date", tempDate.toISOString().split("T")[0]);
    trigger("date");
    setShowDatePicker(false);
  };

  // Start Time Picker handlers
  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        const currentTime = selectedTime || tempStartTime;
        setValue("startTime", currentTime);
        trigger(["startTime", "endTime"]);
      }
      setShowStartTimePicker(false);
    } else {
      // iOS: update temp
      setTempStartTime(selectedTime || tempStartTime);
    }
  };

  const confirmStartTime = () => {
    setValue("startTime", tempStartTime);
    trigger(["startTime", "endTime"]);
    setShowStartTimePicker(false);
  };

  // End Time Picker handlers
  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        const currentTime = selectedTime || tempEndTime;
        setValue("endTime", currentTime);
        trigger(["startTime", "endTime"]);
      }
      setShowEndTimePicker(false);
    } else {
      // iOS: update temp
      setTempEndTime(selectedTime || tempEndTime);
    }
  };

  const confirmEndTime = () => {
    setValue("endTime", tempEndTime);
    trigger(["startTime", "endTime"]);
    setShowEndTimePicker(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateDuration = () => {
    const start = watch("startTime");
    const end = watch("endTime");
    if (end > start) {
      const diff = (end.getTime() - start.getTime()) / (1000 * 60);
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return `${hours}h ${minutes}m`;
    }
    return "Invalid";
  };

  const onSubmit = async (data: FormData) => {
    console.log("Submitted data:", data); // Log for debugging
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
        "flex-row items-center gap-2 flex-1 rounded-full",
        selected && "bg-primary shadow-md"
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
        className={cn(
          "font-medium",
          selected ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {children}
      </Text>
    </Button>
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
    const colors = {
      Hard: { bg: "#3B82F6", lightBg: "#3B82F6/10", border: "#3B82F6/30" },
      Clay: { bg: "#D97706", lightBg: "#D97706/10", border: "#D97706/30" },
      Grass: { bg: "#15803D", lightBg: "#15803D/10", border: "#15803D/30" },
    };

    return (
      <Button
        variant="outline"
        onPress={onPress}
        className={cn(
          "flex-row items-center gap-2 flex-1 rounded-full border",
          selected &&
            `bg-[${colors[surface].lightBg}] border-[${colors[surface].border}] shadow-md`
        )}
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
          className={cn("font-medium", selected ? "" : "text-foreground")}
          style={selected ? { color: colors[surface].bg } : {}}
        >
          {surface}
        </Text>
      </Button>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Add New Match" }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {/* Match Result Card */}
          <Card className="p-6 rounded-2xl shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
              <Trophy size={24} className="text-foreground" />
              <Text className="text-xl font-bold text-foreground">
                Match Result
              </Text>
            </View>

            {inferredWon !== null && (
              <View className="mb-4 p-3 rounded-lg bg-muted/50 flex-row items-center gap-2">
                <MaterialCommunityIcons
                  name={inferredWon ? "trophy" : "close-circle"}
                  size={20}
                  color={inferredWon ? "#22C55E" : "#EF4444"}
                />
                <Text className="font-medium">
                  {inferredWon ? "Victory" : "Defeat"}
                </Text>
              </View>
            )}

            <Label className="text-base font-semibold mb-3">Set Scores</Label>
            <View className="gap-3">
              {fields.map((field, index) => (
                <View key={field.id} className="flex-row items-center gap-3">
                  <Text className="text-sm font-medium text-muted-foreground w-12">
                    Set {index + 1}
                  </Text>
                  <Controller
                    control={control}
                    name={`sets.${index}`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => {
                          onBlur();
                          trigger("sets");
                        }}
                        placeholder="6-4"
                        className="flex-1 rounded-lg"
                      />
                    )}
                  />
                  {fields.length > 2 && (
                    <Pressable onPress={() => removeSet(index)} className="p-2">
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#EF4444"
                      />
                    </Pressable>
                  )}
                </View>
              ))}
              {fields.map((_, index) => (
                <View key={index}>
                  {errors.sets?.[index] && (
                    <Text className="text-destructive text-sm mt-1 ml-16">
                      {errors.sets[index]?.message}
                    </Text>
                  )}
                </View>
              ))}
              {errors.sets?.root && (
                <Text className="text-destructive text-sm mt-2">
                  {errors.sets.root.message}
                </Text>
              )}

              {fields.length < 5 && (
                <Button
                  variant="ghost"
                  onPress={addSet}
                  className="mt-2 self-start"
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={16}
                    color="#3B82F6"
                  />
                  <Text className="text-primary ml-1">Add Set</Text>
                </Button>
              )}
            </View>
          </Card>

          {/* Opponent Selection Card */}
          <Card className="p-6 rounded-2xl shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
              <User size={24} className="text-foreground" />
              <Text className="text-xl font-bold text-foreground">
                Opponent
              </Text>
            </View>

            <Controller
              control={control}
              name="opponentId"
              render={({ field: { value } }) => (
                <>
                  {value ? (
                    <View className="flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <Text className="text-lg font-medium text-foreground">
                        {opponentName}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => setShowOpponentPicker(true)}
                      >
                        <Text className="text-primary">Change</Text>
                      </Button>
                    </View>
                  ) : (
                    <Button
                      variant="outline"
                      onPress={() => setShowOpponentPicker(true)}
                      className="justify-start rounded-lg"
                    >
                      <Text>Select Opponent</Text>
                    </Button>
                  )}
                  {errors.opponentId && (
                    <Text className="text-destructive text-sm mt-2">
                      {errors.opponentId.message}
                    </Text>
                  )}
                </>
              )}
            />

            <Modal
              visible={showOpponentPicker}
              animationType="slide"
              presentationStyle="pageSheet"
            >
              <SafeAreaView className="flex-1 bg-background">
                <View className="p-6">
                  <Text className="text-xl font-bold mb-4">
                    Select Opponent
                  </Text>
                  <ScrollView>
                    {MOCK_OPPONENTS.map((opponent) => (
                      <Pressable
                        key={opponent.id}
                        onPress={() => selectOpponent(opponent)}
                        className="p-4 mb-3 bg-muted/50 rounded-lg"
                      >
                        <Text className="font-semibold text-lg">
                          {opponent.name}
                        </Text>
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
                    <Text>Close</Text>
                  </Button>
                </View>
              </SafeAreaView>
            </Modal>
          </Card>

          {/* Match Details Card */}
          <Card className="p-6 rounded-2xl shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
              <Clock size={24} className="text-foreground" />
              <Text className="text-xl font-bold text-foreground">
                Match Details
              </Text>
            </View>

            <View className="gap-6">
              {/* Date */}
              <View>
                <Label className="text-base font-semibold mb-2 flex-row items-center gap-1">
                  <Calendar size={16} className="text-muted-foreground" />
                  Date
                </Label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field: { value } }) => (
                    <Pressable
                      onPress={() => {
                        setTempDate(new Date(value)); // Reset temp to current
                        setShowDatePicker(true);
                      }}
                      className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                    >
                      <Text className="flex-1">{value}</Text>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color="#64748b"
                      />
                    </Pressable>
                  )}
                />
                {showDatePicker && (
                  <View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                    />
                    {Platform.OS === "ios" && (
                      <View className="flex-row justify-around p-4 bg-background">
                        <Button
                          variant="secondary"
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text>Cancel</Text>
                        </Button>
                        <Button onPress={confirmDate}>
                          <Text>Confirm</Text>
                        </Button>
                      </View>
                    )}
                  </View>
                )}
                {errors.date && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.date.message}
                  </Text>
                )}
              </View>

              {/* Start and End Time */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Label className="text-base font-semibold mb-2">
                    Start Time
                  </Label>
                  <Controller
                    control={control}
                    name="startTime"
                    render={({ field: { value } }) => (
                      <Pressable
                        onPress={() => {
                          setTempStartTime(value); // Reset temp to current
                          setShowStartTimePicker(true);
                        }}
                        className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                      >
                        <Text className="flex-1">{formatTime(value)}</Text>
                        <MaterialCommunityIcons
                          name="clock"
                          size={20}
                          color="#64748b"
                        />
                      </Pressable>
                    )}
                  />
                  {showStartTimePicker && (
                    <View>
                      <DateTimePicker
                        value={tempStartTime}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleStartTimeChange}
                      />
                      {Platform.OS === "ios" && (
                        <View className="flex-row justify-around p-4 bg-background">
                          <Button
                            variant="secondary"
                            onPress={() => setShowStartTimePicker(false)}
                          >
                            <Text>Cancel</Text>
                          </Button>
                          <Button onPress={confirmStartTime}>
                            <Text>Confirm</Text>
                          </Button>
                        </View>
                      )}
                    </View>
                  )}
                  {errors.startTime && (
                    <Text className="text-destructive text-sm mt-1">
                      {errors.startTime.message}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Label className="text-base font-semibold mb-2">
                    End Time
                  </Label>
                  <Controller
                    control={control}
                    name="endTime"
                    render={({ field: { value } }) => (
                      <Pressable
                        onPress={() => {
                          setTempEndTime(value); // Reset temp to current
                          setShowEndTimePicker(true);
                        }}
                        className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                      >
                        <Text className="flex-1">{formatTime(value)}</Text>
                        <MaterialCommunityIcons
                          name="clock"
                          size={20}
                          color="#64748b"
                        />
                      </Pressable>
                    )}
                  />
                  {showEndTimePicker && (
                    <View>
                      <DateTimePicker
                        value={tempEndTime}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleEndTimeChange}
                      />
                      {Platform.OS === "ios" && (
                        <View className="flex-row justify-around p-4 bg-background">
                          <Button
                            variant="secondary"
                            onPress={() => setShowEndTimePicker(false)}
                          >
                            <Text>Cancel</Text>
                          </Button>
                          <Button onPress={confirmEndTime}>
                            <Text>Confirm</Text>
                          </Button>
                        </View>
                      )}
                    </View>
                  )}
                  {errors.endTime && (
                    <Text className="text-destructive text-sm mt-1">
                      {errors.endTime.message}
                    </Text>
                  )}
                </View>
              </View>
              <View className="p-3 bg-muted/50 rounded-lg">
                <Text className="text-sm text-muted-foreground">
                  Duration: {calculateDuration()}
                </Text>
              </View>

              {/* Match Type */}
              <View>
                <Label className="text-base font-semibold mb-3">
                  Match Type
                </Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row gap-3">
                      {MATCH_TYPES.map((type) => (
                        <OptionButton
                          key={type}
                          selected={value === type}
                          onPress={() => onChange(type)}
                        >
                          {type}
                        </OptionButton>
                      ))}
                    </View>
                  )}
                />
                {errors.type && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.type.message}
                  </Text>
                )}
              </View>

              {/* Court Surface */}
              <View>
                <Label className="text-base font-semibold mb-3">
                  Court Surface
                </Label>
                <Controller
                  control={control}
                  name="surface"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row gap-3">
                      {SURFACES.map((surface) => (
                        <SurfaceButton
                          key={surface}
                          surface={surface}
                          selected={value === surface}
                          onPress={() => onChange(surface)}
                        />
                      ))}
                    </View>
                  )}
                />
                {errors.surface && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.surface.message}
                  </Text>
                )}
              </View>
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="mt-6 rounded-full shadow-md"
          >
            <Text className="text-primary-foreground font-bold text-lg">
              {isSubmitting ? "Adding Match..." : "Add Match"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

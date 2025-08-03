import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Alert,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { User } from "~/lib/icons/User";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-native-date-picker";
import { ResultBoard } from "~/components/ResultBoard";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { router } from "expo-router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MATCH_TYPES = ["Singles", "Doubles"] as const;
const SURFACES = ["Hard", "Clay", "Grass"] as const;

const setString = z
  .string()
  .trim()
  .regex(/^\d+-\d+$/, "Use X-Y (6-4, 7-6(8-6) …)");

const formSchema = z.object({
  opponentId: z.string().min(1, "Pick an opponent"),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  type: z.enum(MATCH_TYPES),
  surface: z.enum(SURFACES),
  sets: z.array(setString).min(2).max(5),
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
      startTime: new Date(Date.now() - 120 * 60000), //2 hours
      endTime: new Date(),
      type: MATCH_TYPES[0],
      surface: SURFACES[0],
      sets: ["", ""],
    },
  });

  const opponents = useQuery(api.players.getAll);

  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const watchedValues = watch();
  const selectedOpponent = opponents?.find(
    (o) => o._id === watchedValues.opponentId
  );
  const durationLabel = useDuration(
    watchedValues.startTime,
    watchedValues.endTime
  );

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  if (!opponents) {
    return <View />;
  }

  const handleSelectOpponent = (opponent: (typeof opponents)[0]) => {
    setValue("opponentId", opponent._id);
    setShowOpponentPicker(false);
    trigger("opponentId");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date: Date) => date.toLocaleDateString();

  const onSubmit = async (data: FormData) => {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log("Form data:", data);
      Alert.alert("Success", "Match added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add match. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ResultBoard className="p-6 rounded-2xl shadow-sm" />

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

        <Card className="p-6 rounded-2xl shadow-sm mt-6">
          <View className="flex-row items-center gap-3 mb-4">
            <Clock size={24} className="text-foreground" />
            <Text className="text-xl font-bold">Match Details</Text>
          </View>

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

          <View className="p-3 bg-muted/50 rounded-lg mb-6">
            <Text className="text-sm text-muted-foreground">
              Duration: {durationLabel}
            </Text>
          </View>

          {/* Merged Match Type & Surface using Selects */}
          <View className="gap-6">
            <View>
              <Label className="font-semibold mb-2">Match Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <Select
                    defaultValue={{
                      value,
                      label: value,
                    }}
                    onValueChange={(v) => {
                      onChange(v?.value);
                      trigger("type");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select match type"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets}>
                      <SelectGroup>
                        <SelectLabel>Match Type</SelectLabel>
                        {MATCH_TYPES.map((t) => (
                          <SelectItem key={t} label={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <Text className="text-destructive text-sm mt-2">
                  {errors.type.message}
                </Text>
              )}
            </View>

            <View>
              <Label className="font-semibold mb-2">Court Surface</Label>
              <Controller
                control={control}
                name="surface"
                render={({ field: { value, onChange } }) => (
                  <Select
                    defaultValue={{
                      value,
                      label: value,
                    }}
                    onValueChange={(v) => {
                      onChange(v?.value);
                      trigger("surface");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select surface"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets}>
                      <SelectGroup>
                        <SelectLabel>Surface</SelectLabel>
                        {SURFACES.map((s) => (
                          <SelectItem key={s} label={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.surface && (
                <Text className="text-destructive text-sm mt-2">
                  {errors.surface.message}
                </Text>
              )}
            </View>
          </View>
        </Card>

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

      <Modal visible={showOpponentPicker} animationType="slide">
        <SafeAreaView className="flex-1 bg-background">
          <View className="p-6">
            <Text className="text-xl font-bold mb-4">Select Opponent</Text>
            <ScrollView>
              {opponents.map((opponent) => (
                <Pressable
                  key={opponent._id}
                  onPress={() => handleSelectOpponent(opponent)}
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

      <DatePicker
        modal
        open={showDatePicker}
        date={watchedValues.date}
        mode="date"
        onConfirm={(d) => {
          setValue("date", d);
          setShowDatePicker(false);
          trigger("date");
        }}
        onCancel={() => setShowDatePicker(false)}
      />
      <DatePicker
        modal
        open={showStartPicker}
        date={watchedValues.startTime}
        mode="time"
        onConfirm={(t) => {
          setValue("startTime", t);
          setShowStartPicker(false);
          trigger(["startTime", "endTime"]);
        }}
        onCancel={() => setShowStartPicker(false)}
      />
      <DatePicker
        modal
        open={showEndPicker}
        date={watchedValues.endTime}
        mode="time"
        onConfirm={(t) => {
          setValue("endTime", t);
          setShowEndPicker(false);
          trigger(["startTime", "endTime"]);
        }}
        onCancel={() => setShowEndPicker(false)}
      />
    </SafeAreaView>
  );
}

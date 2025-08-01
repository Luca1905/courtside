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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getWinner, validateMatch } from "~/lib/validator";
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
    date: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
    startTime: z.date(),
    endTime: z.date(),
    type: z.enum(MATCH_TYPES),
    surface: z.enum(SURFACES),
    sets: z.array(setString).min(2).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime)
      ctx.addIssue({
        path: ["endTime"],
        message: "End time must be after start time",
      });

    const bestOf = data.sets.length > 3 ? 5 : 3;
    const res = validateMatch(bestOf, data.sets);
    if (!res.valid)
      res.errors.forEach((e) => ctx.addIssue({ path: ["sets"], message: e }));
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

/* ── generic segmented button ────────────────────────────────── */
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

/* ── component ───────────────────────────────────────────────── */
export default function AddMatchPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponentId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: new Date(),
      endTime: new Date(Date.now() + 90 * 60000),
      type: "Singles",
      surface: "Hard",
      sets: ["", ""],
    },
  });

  const [opponentName, setOpponentName] = useState("");
  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(watch("date")));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [tempStart, setTempStart] = useState(watch("startTime"));

  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempEnd, setTempEnd] = useState(watch("endTime"));

  /* winner badge */
  const winner = getWinner(watch("sets"));

  const selectOpponent = (o: (typeof MOCK_OPPONENTS)[0]) => {
    setValue("opponentId", o.id);
    setOpponentName(o.name);
    setShowOpponentPicker(false);
    trigger("opponentId");
  };
  const timeLabel = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const durationLabel = useDuration(watch("startTime"), watch("endTime"));

  /* ── submit ─ */
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      console.log(data);
      Alert.alert("Success", "Match added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to add match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── JSX ─ */
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ title: "Add New Match" }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Result ────────────────────────── */}
        <ResultBoard className="p-6 rounded-2xl shadow-sm" />

        {/* ── Opponent ───────────────────────── */}
        <Card className="p-6 rounded-2xl shadow-sm mt-6">
          <View className="flex-row items-center gap-3 mb-4">
            <User size={24} className="text-foreground" />
            <Text className="text-xl font-bold">Opponent</Text>
          </View>

          <Controller
            control={control}
            name="opponentId"
            render={({ field }) =>
              field.value ? (
                <View className="flex-row items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <Text className="text-lg font-medium">{opponentName}</Text>
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
              )
            }
          />
          {errors.opponentId && (
            <Text className="text-destructive text-sm mt-2">
              {errors.opponentId.message}
            </Text>
          )}

          {/* modal */}
          <Modal visible={showOpponentPicker} animationType="slide">
            <SafeAreaView className="flex-1 bg-background">
              <View className="p-6">
                <Text className="text-xl font-bold mb-4">Select Opponent</Text>
                <ScrollView>
                  {MOCK_OPPONENTS.map((o) => (
                    <Pressable
                      key={o.id}
                      onPress={() => selectOpponent(o)}
                      className="p-4 mb-3 bg-muted/50 rounded-lg"
                    >
                      <Text className="font-semibold text-lg">{o.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {o.club}
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

        {/* ── Match details ──────────────────── */}
        <Card className="p-6 rounded-2xl shadow-sm mt-6">
          <View className="flex-row items-center gap-3 mb-4">
            <Clock size={24} className="text-foreground" />
            <Text className="text-xl font-bold">Match Details</Text>
          </View>

          {/* date */}
          <Label className="font-semibold mb-2 flex-row items-center gap-1">
            <Calendar size={16} className="text-muted-foreground" />
            Date
          </Label>

          <DatePicker
            modal
            date={date}
            open={showDatePicker}
            mode="date"
            onConfirm={(date) => {
              setShowDatePicker(false);
              setDate(date);
            }}
            onCancel={() => {
              setShowDatePicker(false);
            }}
          />
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <>
                <Pressable
                  onPress={() => {
                    setDate(new Date(field.value));
                    setShowDatePicker(true);
                  }}
                  className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                >
                  <Text className="flex-1">{field.value}</Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#64748b"
                  />
                </Pressable>
              </>
            )}
          />
          {errors.date && (
            <Text className="text-destructive text-sm mt-1">
              {errors.date.message}
            </Text>
          )}

          {/* start / end time */}
          <View className="flex-row gap-4 mt-6">
            {[
              {
                label: "Start Time",
                field: "startTime" as const,
                show: showStartPicker,
                setShow: setShowStartPicker,
                temp: tempStart,
                setTemp: setTempStart,
              },
              {
                label: "End Time",
                field: "endTime" as const,
                show: showEndPicker,
                setShow: setShowEndPicker,
                temp: tempEnd,
                setTemp: setTempEnd,
              },
            ].map(({ label, field, show, setShow, temp, setTemp }) => (
              <View key={field} className="flex-1">
                <Label className="font-semibold mb-2">{label}</Label>
                <Controller
                  control={control}
                  name={field}
                  render={({ field: f }) => (
                    <Pressable
                      onPress={() => {
                        setTemp(f.value);
                        setShow(true);
                      }}
                      className="bg-muted/50 p-4 rounded-lg flex-row items-center"
                    >
                      <Text className="flex-1">{timeLabel(f.value)}</Text>
                      <MaterialCommunityIcons
                        name="clock"
                        size={20}
                        color="#64748b"
                      />
                    </Pressable>
                  )}
                />
                {
                  // <DatePicker
                  //   modal
                  //   date={tempDate}
                  //   open={showDatePicker}
                  //   mode="date"
                  //   onConfirm={(date) => {
                  //     setShowDatePicker(false);
                  //     setTempDate(date);
                  //   }}
                  //   onCancel={() => {
                  //     setShowDatePicker(false);
                  //   }}
                  // />
                }
                {errors[field] && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors[field]?.message as string}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* duration */}
          <View className="p-3 bg-muted/50 rounded-lg mt-4">
            <Text className="text-sm text-muted-foreground">
              Duration: {durationLabel}
            </Text>
          </View>

          {/* match type */}
          <View className="mt-6">
            <Label className="font-semibold mb-3">Match Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <View className="flex-row gap-3">
                  {MATCH_TYPES.map((t) => (
                    <SegmentBase
                      key={t}
                      selected={field.value === t}
                      onPress={() => field.onChange(t)}
                    >
                      {t}
                    </SegmentBase>
                  ))}
                </View>
              )}
            />
          </View>

          {/* surface */}
          <View className="mt-6">
            <Label className="font-semibold mb-3">Court Surface</Label>
            <Controller
              control={control}
              name="surface"
              render={({ field }) => (
                <View className="flex-row gap-3">
                  {SURFACES.map((s) => (
                    <SurfaceButton
                      key={s}
                      surface={s}
                      selected={field.value === s}
                      onPress={() => field.onChange(s)}
                    />
                  ))}
                </View>
              )}
            />
          </View>
        </Card>

        {/* submit */}
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
    </SafeAreaView>
  );
}

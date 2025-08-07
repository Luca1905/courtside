import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { AppleMaps } from "expo-maps";
import { AppleMapsMapType } from "expo-maps/build/apple/AppleMaps.types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import { ResultBoard } from "~/components/ResultBoard";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { DEFAULT_LOCATION_COORDS } from "~/constants/location";
import { api } from "~/convex/_generated/api";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { useCurrentLocation } from "~/hooks/useCurrentLocation";
import { Calendar } from "~/lib/icons/Calendar";
import { Clock } from "~/lib/icons/Clock";
import { User } from "~/lib/icons/User";
import { calculateMatchDuration, formatDuration } from "~/lib/match";
import { validateMatchScore } from "~/lib/validator";

const MATCH_TYPES = ["Singles", "Doubles"] as const;
const SURFACES = ["Hard", "Clay", "Grass"] as const;
const TEAMS = ["Home", "Guest"] as const;

const formSchema = z.object({
  opponentId: z.string().min(1, "Pick an opponent"),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  type: z.enum(MATCH_TYPES),
  surface: z.enum(SURFACES),
  playerTeam: z.enum(TEAMS),
  venue: z.object({
    name: z.string().min(1, "Enter a venue name"),
    coordinates: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
      })
      .refine((l) => l.latitude !== 0 || l.longitude !== 0, {
        message: "Pick a location on the map",
      }),
  }),
  sets: z
    .array(
      z.object({
        guest: z.number(),
        home: z.number(),
      })
    )
    .length(3),
});
type FormData = z.infer<typeof formSchema>;

function useDuration(start: Date, end: Date) {
  const [label, setLabel] = useState("Invalid");
  useEffect(() => {
    if (end <= start) {
      setLabel("Invalid");
      return;
    }
    const minutes = calculateMatchDuration(start.getTime(), end.getTime());
    setLabel(formatDuration(minutes));
  }, [start, end]);
  return label;
}

export default function AddMatchPage() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const {
    isLoading: isLoadingLocation,
    location,
    error: locationError,
  } = useCurrentLocation();
  if (locationError) console.log(locationError);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponentId: "",
      date: new Date(),
      startTime: new Date(Date.now() - 120 * 60000),
      endTime: new Date(),
      type: MATCH_TYPES[0],
      surface: SURFACES[0],
      playerTeam: TEAMS[0],
      venue: {
        name: "",
        coordinates: DEFAULT_LOCATION_COORDS,
      },
      sets: [
        { home: 0, guest: 0 },
        { home: 0, guest: 0 },
        { home: 0, guest: 0 },
      ],
    },
  });

  const addMatch = useMutation(api.matches.addMatch);
  const opponents = useQuery(api.players.getAll);
  const playerForUser = useQuery(api.players.getForCurrentUser);
  const watched = watch();
  const selectedOpponent = opponents?.find((o) => o._id === watched.opponentId);
  const durationLabel = useDuration(watched.startTime, watched.endTime);

  // UI state for modals / pickers
  const [showOpponentPicker, setShowOpponentPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);

  // Pull live venue form-state into local variables
  const venue = useWatch({ control, name: "venue" });
  const { name: venueName, coordinates: venueCoords } = venue;

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const screenHeight = Dimensions.get("window").height;
  const firstScreenMinHeight = Math.max(
    0,
    screenHeight - (insets.top + insets.bottom) - 100
  );

  if (!playerForUser) {
    return <Text>Not Authenticated</Text>;
  }

  const handleSelectOpponent = (o: Doc<"players">) => {
    setValue("opponentId", o._id);
    setShowOpponentPicker(false);
    trigger("opponentId");
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const onSubmit = async (data: FormData) => {
    try {
      const { valid, winner } = validateMatchScore(data.sets);
      if (!valid || !winner) {
        Alert.alert("Failed", "Match is not complete");
        return;
      }

      addMatch({
        sets: data.sets,
        surface: data.surface,
        type: data.type,
        venue: data.venue,
        date: data.date.toISOString(),
        players: {
          guest:
            data.playerTeam === "Guest"
              ? playerForUser._id
              : (data.opponentId as Id<"players">),
          home:
            data.playerTeam === "Home"
              ? playerForUser._id
              : (data.opponentId as Id<"players">),
        },
        startTime: data.startTime.getTime(),
        endTime: data.endTime.getTime(),
        winner,
        // TODO: add weather api
        weather: {
          temperature: 20,
          windSpeed: 10,
          precipitation: 0,
          humidity: 50,
        },
      });

      Alert.alert("Success", "Match added!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not add match");
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ minHeight: firstScreenMinHeight }}
          className="items-stretch justify-center px-6"
        >
          <Controller
            control={control}
            name="sets"
            render={({ field: { onChange, value } }) => (
              <ResultBoard
                score={value}
                className="p-0 rounded-2xl shadow-sm"
                onChange={onChange}
              />
            )}
          />
          {errors.sets && (
            <Text className="text-destructive text-sm mt-2">
              {errors.sets.message}
            </Text>
          )}
        </View>

        {/* Opponent Picker */}
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
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
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
                    <Text className="flex-1">
                      {field.value.toLocaleDateString()}
                    </Text>
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
          </View>

          {/* Venue */}
          <Label className="font-semibold mb-2">Venue</Label>
          <Controller
            control={control}
            name="venue"
            render={({ field: { value, onChange } }) => (
              <>
                <Pressable
                  onPress={() => setShowVenuePicker(true)}
                  className="p-4 bg-muted/50 rounded-lg mb-6"
                >
                  {value.name ? (
                    <>
                      <Text className="font-semibold">{value.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {value.coordinates.latitude.toFixed(4)},{" "}
                        {value.coordinates.longitude.toFixed(4)}
                      </Text>
                    </>
                  ) : (
                    <Text>Select venue</Text>
                  )}
                </Pressable>
                {errors.venue && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.venue.message}
                  </Text>
                )}

                <Modal
                  visible={showVenuePicker}
                  animationType="slide"
                  transparent
                >
                  {/* Full-screen map */}
                  <View style={StyleSheet.absoluteFill}>
                    {isLoadingLocation ? (
                      <Text>Loading...</Text>
                    ) : (
                      <AppleMaps.View
                        style={{ flex: 1 }}
                        cameraPosition={{
                          coordinates:
                            location?.coords || DEFAULT_LOCATION_COORDS,
                          zoom: 15,
                        }}
                        onCameraMove={({ coordinates }) => {
                          if (
                            typeof coordinates.latitude !== "number" ||
                            typeof coordinates.longitude !== "number"
                          ) {
                            console.error("Invalid map coordinates");
                            return;
                          }
                          onChange({
                            name: venueName,
                            coordinates: {
                              latitude: coordinates.latitude,
                              longitude: coordinates.longitude,
                            },
                          });
                        }}
                        properties={{
                          isMyLocationEnabled: true,
                          isTrafficEnabled: false,
                          selectionEnabled: true,
                          mapType: AppleMapsMapType.HYBRID,
                        }}
                        uiSettings={{
                          scaleBarEnabled: true,
                          myLocationButtonEnabled: true,
                          compassEnabled: true,
                          togglePitchEnabled: false,
                        }}
                      />
                    )}
                  </View>

                  {/* Floating pin */}
                  <View
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                    className={`justify-center -translate-y-4 items-center pt-[${bottom}px]`}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={32}
                      color="red"
                    />
                  </View>

                  {/* Bottom sheet */}
                  <View
                    className="absolute bottom-0 left-0 right-0 p-4 bg-white/50"
                    pointerEvents="auto"
                  >
                    <SafeAreaView>
                      <Input
                        placeholder="Venue name"
                        value={venueName}
                        onChangeText={(text) =>
                          onChange({
                            name: text,
                            coordinates: venueCoords,
                          })
                        }
                      />
                      <View className="flex-row justify-between mt-4">
                        <Button
                          variant="secondary"
                          onPress={() => setShowVenuePicker(false)}
                        >
                          <Text>Cancel</Text>
                        </Button>
                        <Button
                          onPress={() => {
                            trigger("venue");
                            setShowVenuePicker(false);
                          }}
                          className="bg-green-600"
                        >
                          <Text className="text-primary-foreground font-bold">
                            Confirm
                          </Text>
                        </Button>
                      </View>
                    </SafeAreaView>
                  </View>
                </Modal>
              </>
            )}
          />

          {/* Start & End Time */}
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

          {/* Duration */}
          <View className="p-3 bg-muted/50 rounded-lg mb-6">
            <Text className="text-sm text-muted-foreground">
              Duration: {durationLabel}
            </Text>
          </View>

          {/* Match Type & Surface & Playerside */}
          <View className="gap-6">
            {/* Type */}
            <View>
              <Label className="font-semibold mb-2">Match Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <Select
                    defaultValue={{ value, label: value }}
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

            {/* Surface */}
            <View>
              <Label className="font-semibold mb-2">Court Surface</Label>
              <Controller
                control={control}
                name="surface"
                render={({ field: { value, onChange } }) => (
                  <Select
                    defaultValue={{ value, label: value }}
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

            {/* Side */}
            <View>
              <Label className="font-semibold mb-2">You played as</Label>
              <Controller
                control={control}
                name="playerTeam"
                render={({ field: { value, onChange } }) => (
                  <Select
                    defaultValue={{
                      value,
                      label: value.charAt(0).toUpperCase() + value.slice(1),
                    }}
                    onValueChange={(v) => {
                      onChange(v?.value);
                      trigger("playerTeam");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="text-foreground text-sm native:text-lg"
                        placeholder="Select side"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets}>
                      <SelectGroup>
                        <SelectLabel>Your Side</SelectLabel>
                        {TEAMS.map((s) => {
                          const label = s.charAt(0).toUpperCase() + s.slice(1);
                          return (
                            <SelectItem key={s} value={s} label={label}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.playerTeam && (
                <Text className="text-destructive text-sm mt-2">
                  {errors.playerTeam.message}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Submit */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-8 rounded-full shadow-md bg-green-600"
        >
          <Text className="text-primary-foreground font-bold">
            {isSubmitting ? "Adding…" : "Add Match"}
          </Text>
        </Button>
      </ScrollView>

      {/* Opponent Modal */}
      <Modal visible={showOpponentPicker} animationType="slide">
        <SafeAreaView className="flex-1 bg-background">
          <View className="p-6">
            <Text className="text-xl font-bold mb-4">Select Opponent</Text>
            <ScrollView>
              {opponents?.map((o) => (
                <Pressable
                  key={o._id}
                  onPress={() => handleSelectOpponent(o)}
                  className="p-4 mb-3 bg-muted/50 rounded-lg"
                >
                  <Text className="font-semibold text-lg">{o.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {o.club}
                  </Text>
                </Pressable>
              ))}
              <Button
                className="p-4 mb-3 bg-blue-500 rounded-lg"
                onPress={() => {
                  setShowOpponentPicker(false);
                  router.push("/player/add");
                }}
              >
                <Text className="text-center text-white">Add Opponent</Text>
              </Button>
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

      {/* Date & Time Pickers */}
      <DatePicker
        modal
        open={showDatePicker}
        date={watched.date}
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
        date={watched.startTime}
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
        date={watched.endTime}
        mode="time"
        onConfirm={(t) => {
          setValue("endTime", t);
          setShowEndPicker(false);
          trigger(["startTime", "endTime"]);
        }}
        onCancel={() => setShowEndPicker(false)}
      />
    </>
  );
}

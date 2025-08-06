import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { z } from "zod";
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
import { api } from "~/convex/_generated/api";

const ARM_OPTIONS = ["Left", "Right"] as const;
const GRIP_OPTIONS = ["One-Handed", "Two-Handed"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  club: z.string().optional(),
  ranking: z
    .float32("Ranking must be a number")
    .min(1, "Must be at least 1")
    .optional(),
  hittingArm: z.enum(ARM_OPTIONS).optional(),
  backhandGrip: z.enum(GRIP_OPTIONS).optional(),
  playingSince: z
    .number("Year must be a number")
    .int("Must be an integer")
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Cannot be in future")
    .optional(),
  birthYear: z
    .number("Year must be a number")
    .int("Must be an integer")
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Cannot be in future")
    .optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function AddPlayerPage() {
  const userId = useQuery(api.players.currentUserId);
  const playerForUser = useQuery(api.players.getForCurrentUser);
  const isLoading = playerForUser === undefined || userId === undefined;
  const isSelf = playerForUser === null;

  const [rankingDisplayValue, setRankingDisplayValue] = React.useState("");

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      club: "",
      ranking: undefined,
      hittingArm: undefined,
      backhandGrip: undefined,
      playingSince: undefined,
      birthYear: undefined,
    },
  });

  const addPlayer = useMutation(api.players.addPlayer);

  if (!userId) {
    return <Text>You are not authenticated</Text>;
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const onSubmit = async (data: FormData) => {
    try {
      if (!playerForUser) {
        await addPlayer({ ...data, userId });
      }
      await addPlayer(data);
      Alert.alert("Success", isSelf ? "Profile created" : "Player added", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not add player");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Card className="p-6 rounded-2xl shadow-sm mb-4">
        {/* Heading */}
        <Text className="text-xl font-bold mb-2">
          {isSelf ? "Create Your Player Profile" : "Add New Player"}
        </Text>
        {isSelf && (
          <Text className="mb-4 text-sm text-gray-600">
            Since you don’t have a player profile yet, this will represent you.
          </Text>
        )}

        {/* Name */}
        <Label className="font-semibold mb-1">Name *</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              placeholder="Full name"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.name && (
          <Text className="text-destructive text-sm">
            {errors.name.message}
          </Text>
        )}

        {/* Club */}
        <Label className="font-semibold mt-4 mb-1">Club</Label>
        <Controller
          control={control}
          name="club"
          render={({ field }) => (
            <Input
              placeholder="Club name (optional)"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.club && (
          <Text className="text-destructive text-sm">
            {errors.club.message}
          </Text>
        )}

        {/* Ranking */}
        <Label className="font-semibold mt-4 mb-1">Ranking</Label>
        <Input
          placeholder="e.g. 16.5 (optional)"
          keyboardType="numeric"
          value={rankingDisplayValue}
          onChangeText={(t) => {
            // Replace all commas with dots and allow decimal input
            const normalized = t.replace(",", ".");

            // Update display value immediately
            setRankingDisplayValue(normalized);

            // Allow empty string, numbers, and decimal numbers
            if (normalized === "" || /^\d*\.?\d*$/.test(normalized)) {
              if (normalized === "") {
                setValue("ranking", undefined);
              } else {
                const num = Number(normalized);
                if (!isNaN(num)) {
                  setValue("ranking", num);
                }
              }
              trigger("ranking");
            }
          }}
          onBlur={() => {
            // Sync display value with form value on blur
            const currentValue = control._formValues.ranking;
            if (currentValue != null) {
              setRankingDisplayValue(String(currentValue));
            }
          }}
        />
        {errors.ranking && (
          <Text className="text-destructive text-sm">
            {errors.ranking.message}
          </Text>
        )}

        {/* Hitting Arm */}
        <Label className="font-semibold mt-4 mb-1">Hitting Arm</Label>
        <Controller
          control={control}
          name="hittingArm"
          render={({ field: { onChange } }) => (
            <Select
              defaultValue={undefined}
              onValueChange={(v) => {
                onChange(v?.value);
                trigger("hittingArm");
              }}
            >
              <SelectTrigger>
                <SelectValue
                  className="text-foreground text-sm native:text-lg"
                  placeholder="Left / Right"
                />
              </SelectTrigger>
              <SelectContent forceMount>
                <SelectGroup>
                  <SelectLabel>Hitting Arm</SelectLabel>
                  {ARM_OPTIONS.map((opt) => (
                    <SelectItem key={opt} label={opt} value={opt}>
                      <Text>{opt}</Text>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.hittingArm && (
          <Text className="text-destructive text-sm">
            {errors.hittingArm.message}
          </Text>
        )}

        {/* Backhand Grip */}
        <Label className="font-semibold mt-4 mb-1">Backhand Grip</Label>
        <Controller
          control={control}
          name="backhandGrip"
          render={({ field: { onChange } }) => (
            <Select
              defaultValue={undefined}
              onValueChange={(v) => {
                onChange(v?.value);
                trigger("backhandGrip");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="One-Handed / Two-Handed" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Backhand Grip</SelectLabel>
                  {GRIP_OPTIONS.map((opt) => (
                    <SelectItem key={opt} label={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.backhandGrip && (
          <Text className="text-destructive text-sm">
            {errors.backhandGrip.message}
          </Text>
        )}

        {/* Playing Since */}
        <Label className="font-semibold mt-4 mb-1">Playing Since</Label>
        <Controller
          control={control}
          name="playingSince"
          render={({ field: { value, onBlur } }) => (
            <Input
              placeholder="Year (optional)"
              keyboardType="numeric"
              value={value != null ? String(value) : ""}
              onChangeText={(t) => {
                // Only allow integers
                if (t === "" || /^\d+$/.test(t)) {
                  if (t === "") {
                    setValue("playingSince", undefined);
                  } else {
                    const num = Number(t);
                    if (!isNaN(num)) {
                      setValue("playingSince", num);
                    }
                  }
                  trigger("playingSince");
                }
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.playingSince && (
          <Text className="text-destructive text-sm">
            {errors.playingSince.message}
          </Text>
        )}

        {/* Birth Year */}
        <Label className="font-semibold mt-4 mb-1">Birth Year</Label>
        <Controller
          control={control}
          name="birthYear"
          render={({ field: { value, onBlur } }) => (
            <Input
              placeholder="Year (optional)"
              keyboardType="numeric"
              value={value != null ? String(value) : ""}
              onChangeText={(t) => {
                // Only allow integers
                if (t === "" || /^\d+$/.test(t)) {
                  if (t === "") {
                    setValue("birthYear", undefined);
                  } else {
                    const num = Number(t);
                    if (!isNaN(num)) {
                      setValue("birthYear", num);
                    }
                  }
                  trigger("birthYear");
                }
              }}
              onBlur={onBlur}
            />
          )}
        />
        {errors.birthYear && (
          <Text className="text-destructive text-sm">
            {errors.birthYear.message}
          </Text>
        )}

        {/* Submit */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="mt-8 rounded-full shadow-md bg-green-600"
        >
          <Text className="text-primary-foreground font-bold">
            {isSubmitting
              ? isSelf
                ? "Creating…"
                : "Adding…"
              : isSelf
                ? "Create Profile"
                : "Add Player"}
          </Text>
        </Button>
      </Card>
    </ScrollView>
  );
}

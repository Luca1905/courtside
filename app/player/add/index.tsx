import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";
import { z } from "zod";
import { api } from "~/convex/_generated/api";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { Portal, PortalHost } from "@rn-primitives/portal";

const ARM_OPTIONS = ["Left", "Right"] as const;
const GRIP_OPTIONS = ["One-Handed", "Two-Handed"] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  club: z.string().optional(),
  ranking: z
    .number("Ranking must be a number")
    .min(1, "Must be at least 1")
    .optional(),
  hittingArm: z.enum(ARM_OPTIONS).optional(),
  backhandGrip: z.enum(GRIP_OPTIONS).optional(),
  playingSince: z
    .int("Year must be a valid number")
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Cannot be in future")
    .optional(),
  birthYear: z
    .int("Year must be a valid number")
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Cannot be in future")
    .optional(),
});
type FormData = z.infer<typeof formSchema>;

export default function AddPlayerPage() {
  const {
    control,
    handleSubmit,
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

  const onSubmit = async (data: FormData) => {
    try {
      await addPlayer(data);
      Alert.alert("Success", "Player added", [
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
        <Text className="text-xl font-bold mb-4">Add New Player</Text>

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
        <Controller
          control={control}
          name="ranking"
          render={({ field }) => (
            <Input
              placeholder="e.g. 16 (optional)"
              keyboardType="numeric"
              value={field.value != null ? String(field.value) : ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
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
          render={({ field }) => (
            <Select
              defaultValue={undefined}
              onValueChange={field.onChange}
              className="z-100"
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
        <Portal name="example-portal" hostName="example-host">
          <View>
            <Text>I will be rendered above the Content component</Text>
          </View>
        </Portal>

        {/* Backhand Grip */}
        <Label className="font-semibold mt-4 mb-1">Backhand Grip</Label>
        <Controller
          control={control}
          name="backhandGrip"
          render={({ field }) => (
            <Select defaultValue={undefined} onValueChange={field.onChange}>
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
          render={({ field }) => (
            <Input
              placeholder="Year (optional)"
              keyboardType="numeric"
              value={field.value != null ? String(field.value) : ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
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
          render={({ field }) => (
            <Input
              placeholder="Year (optional)"
              keyboardType="numeric"
              value={field.value != null ? String(field.value) : ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
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
            {isSubmitting ? "Adding…" : "Add Player"}
          </Text>
        </Button>
      </Card>
      <PortalHost name="test-host" />
    </ScrollView>
  );
}

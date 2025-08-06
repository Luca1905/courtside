import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        onPress={() => {
          void signIn("anonymous");
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace("/");
        }}
      >
        Get Started
      </Text>
    </View>
  );
}

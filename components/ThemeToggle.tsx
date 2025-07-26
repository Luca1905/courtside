import { Pressable, View } from "react-native";
import { MoonStar } from "~/lib/icons/MoonStar";
import { Sun } from "~/lib/icons/Sun";
import { useColorScheme } from "~/lib/useColorScheme";

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();

  const toggleColorScheme = () => {
    const newTheme = isDarkColorScheme ? "light" : "dark";
    setColorScheme(newTheme);
  };

  return (
    <Pressable
      onPress={toggleColorScheme}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 active:opacity-70"
    >
      <View className="w-10 h-10 justify-center items-center">
        {isDarkColorScheme ? (
          <MoonStar className="text-foreground" size={20} strokeWidth={1.25} />
        ) : (
          <Sun className="text-foreground" size={20} strokeWidth={1.25} />
        )}
      </View>
    </Pressable>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon } from "@expo/vector-icons/build/createIconSet";

export type MaterialCommunityIconNames =
  typeof MaterialCommunityIcons extends Icon<infer G, any> ? G : never;

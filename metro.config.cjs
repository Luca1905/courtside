import getDefaultConfig from "expo/metro-config";
import withNativeWind from "nativewind/metro";
import path from "node:path";

const config = getDefaultConfig(path.dirname());

export default withNativeWind(config, { input: "./styles/global.css" });

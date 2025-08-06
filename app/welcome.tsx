import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

const gap = 10;

// https://github.com/arunabhverma/expo-welcome-screen-example
interface HeadTextProps {
  text?: string;
  side?: "left" | "right";
  image?: ImageSourcePropType;
}

const HeadText = (props: HeadTextProps) => {
  const { text, side, image } = props;
  const [totalWidth, setTotalWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const width = totalWidth - textWidth - gap;

  const Transition = LinearTransition.delay(1650)
    .springify()
    .damping(18)
    .stiffness(50);
  const LeftSlide = SlideInLeft.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50);
  const RightSlide = SlideInRight.delay(1500)
    .springify()
    .damping(18)
    .stiffness(50);

  return (
    <Animated.View
      entering={FadeIn.delay(1000).springify().damping(18).stiffness(50)}
      layout={Transition}
      onLayout={(event) => {
        setTotalWidth(event.nativeEvent.layout.width);
      }}
      style={styles.headerContainer}
    >
      {Boolean(width > 0) && side === "left" && (
        <Animated.View
          entering={LeftSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
      {Boolean(text) && (
        <Animated.Text
          layout={Transition}
          onLayout={(event) => {
            setTextWidth(event.nativeEvent.layout.width);
          }}
          style={styles.headText}
          className="text-primary"
        >
          {text}
        </Animated.Text>
      )}
      {Boolean(width > 0) && side === "right" && (
        <Animated.View
          entering={RightSlide}
          style={[styles.embedImage, { width }]}
        >
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default function Welcome() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuthActions();

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
      className="bg-background"
    >
      <View style={{ gap }}>
        <HeadText
          text="Your"
          side="right"
          image={require("../assets/images/one.jpg")}
        />
        <HeadText
          text="All-In-One"
          side="right"
          image={require("../assets/images/two.jpg")}
        />
        <HeadText
          text="Creative"
          side="left"
          image={require("../assets/images/three.jpg")}
        />
        <HeadText text="Powerhouse" />
        <HeadText side="right" image={require("../assets/images/four.jpg")} />
        <Button
          size="lg"
          className="m-3"
          onPress={() => {
            void signIn("anonymous");
            router.push("/");
          }}
        >
          <Text>Get Started</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    justifyContent: "center",
    gap: gap,
    height: 80,
  },
  embedImage: {
    height: 80,
    borderRadius: 22,
    overflow: "hidden",
  },
  headText: {
    fontSize: 70,
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

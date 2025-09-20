// components/AnimatedScreen.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing } from "react-native";

const { width } = Dimensions.get("window");

export default function AnimatedScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    // Reset before each screen mount
    slideAnim.setValue(width);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350, // slightly longer = smoother
      easing: Easing.out(Easing.exp), // 👈 natural easing
      useNativeDriver: true,
    }).start();
  }, []); // only run once per mount (not every render!)

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

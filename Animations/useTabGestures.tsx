import type { Href } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type Direction = "left" | "right";

export const useTabGestures = (tabRoutes: string[]) => {
  const router = useRouter();
  const segments = useSegments();

  const getCurrentTabIndex = useCallback(() => {
    // Get the last segment (current route)
    const currentRoute = segments[segments.length - 1];

    // Handle the index route - when on index tab, the route might be undefined or "(tabs)"
    if (!currentRoute || currentRoute === "(tabs)") {
      return 0; // index is the first tab
    }

    // Find the route in our tabRoutes array
    const index = tabRoutes.indexOf(currentRoute);

    // Return found index, or 0 (index) as fallback
    return index >= 0 ? index : 0;
  }, [segments, tabRoutes]);

  const navigateToTab = useCallback(
    (direction: Direction) => {
      const currentIndex = getCurrentTabIndex();
      let targetIndex: number;

      if (direction === "left") {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else if (direction === "right") {
        targetIndex =
          currentIndex < tabRoutes.length - 1 ? currentIndex + 1 : currentIndex;
      } else {
        return;
      }

      if (targetIndex !== currentIndex) {
        const targetRoute = tabRoutes[targetIndex];
        // For index route, navigate to the base tabs path
        const path = targetRoute === "" ? "/(tabs)/" : `/(tabs)/${targetRoute}`;

        router.push(path as Href);
      }
    },
    [getCurrentTabIndex, router, tabRoutes]
  );

  const createPanGesture = useCallback(() => {
    return Gesture.Pan()
      .activeOffsetX([-15, 15])
      .failOffsetY([-20, 20])
      .onEnd((event) => {
        "worklet";
        const { translationX, velocityX } = event;

        const SWIPE_THRESHOLD = 50;
        const VELOCITY_THRESHOLD = 300;

        if (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) {
          runOnJS(navigateToTab)("left");
        } else if (
          translationX < -SWIPE_THRESHOLD ||
          velocityX < -VELOCITY_THRESHOLD
        ) {
          runOnJS(navigateToTab)("right");
        }
      });
  }, [navigateToTab]);

  return {
    getCurrentTabIndex,
    navigateToTab,
    createPanGesture,
  };
};

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTabGestures } from "./../../Animations/useTabGestures";

export default function TabLayout() {
  const tabRoutes = ["", "player", "favourite"];
  const { navigateToTab } = useTabGestures(tabRoutes);

  // Create the pan gesture using the new API
  const panGesture = Gesture.Pan()
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: "#FF4C29",
              tabBarInactiveTintColor: "#999",
              tabBarStyle: {
                backgroundColor: "#1E1E1E",
                borderTopWidth: 0,
                height: 60,
                paddingBottom: 5,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
              },
              tabBarHideOnKeyboard: true,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Music",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="musical-notes" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="player"
              options={{
                title: "Player",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="play-circle" size={size} color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="favourite"
              options={{
                title: "Favourite",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="heart" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

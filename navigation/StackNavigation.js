import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screen/HomeScreen";
import FaveriteScreen from "../screen/FaveriteScreen";
import DetailScreen from "../screen/DetailScreen";

const Stack = createStackNavigator();

// Stack for home page
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      gestureEnabled: true,
    }}
  >
    <Stack.Screen
      name="Shopee"
      component={HomeScreen}
      options={{
        headerTitleAlign: "center",
      }}
    />
    <Stack.Screen
      name="Detail Product"
      component={DetailScreen}
      options={{
        headerTitleAlign: "center",
        headerBackTitleVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Stack for favorite list product
const FavoriteStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="My Wish List"
        component={FaveriteScreen}
        options={{
          headerTitleAlign: "center",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export { HomeStack, FavoriteStack };

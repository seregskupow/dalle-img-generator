import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Imagine } from "./screens/Imagine";
import { Saved } from "./screens/Saved";
import BottomBar from "./components/BottomBar";

const Tab = createBottomTabNavigator();

export default function Routes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(tabProps) => <BottomBar {...tabProps} />}
    >
      <Tab.Screen
        name="Imagine"
        component={Imagine}
        options={{
          tabBarLabel: "Imagine",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="blender-software" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Saved"
        component={Saved}
        options={{
          tabBarLabel: "Saved",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="bookmark-multiple" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}

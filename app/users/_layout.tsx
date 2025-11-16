import { Stack } from "expo-router";
import React from "react";

export default function UsersLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="mis-rutinas"
        options={{
          title: "Mis Rutinas",
          headerBackTitle: "Atrás",
        }}
      />
    </Stack>
  );
}

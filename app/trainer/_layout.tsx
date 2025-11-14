import { Stack } from "expo-router";
import React from "react";

/**
 * Trainer Layout - Stack Navigator para las pantallas de entrenador
 *
 * Maneja la navegación entre las diferentes pantallas específicas para entrenadores
 */
export default function TrainerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f8f9fa",
        },
        headerTintColor: "#1f2937",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="crear"
        options={{
          title: "Crear",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

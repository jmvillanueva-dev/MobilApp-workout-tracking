import { Stack } from "expo-router";
import React from "react";

/**
 * Auth Layout - Stack Navigator para las pantallas de autenticación
 *
 * Maneja la navegación entre login y registro dentro del grupo auth
 */
export default function AuthLayout() {
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
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          title: "Rutinas",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

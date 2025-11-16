import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/src/presentation/contexts/AuthProvider";

/**
 * Tab Layout - Navegación por pestañas principal
 *
 * Maneja la navegación entre las pantallas principales de la aplicación.
 * Las pestañas mostradas dependen del rol del usuario:
 * - Usuario: Inicio, Progreso, Chat, Perfil
 * - Entrenador: Inicio, Rutinas (explore), Chat, Perfil
 */
export default function TabLayout() {
  const { usuario } = useAuth();
  const isTrainer = usuario?.role === "entrenador";

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f8f9fa",
        },
        headerTintColor: "#1f2937",
        headerTitleStyle: {
          fontWeight: "600",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingTop: 10,
          paddingBottom: 10,
        },
        headerShadowVisible: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* Pantalla específica para entrenadores */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Rutinas",
          headerShown: false,
          href: isTrainer ? "/explore" : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="dumbbell.fill" color={color} />
          ),
        }}
      />

      {/* Pantalla específica para usuarios */}
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          headerShown: false,
          href: !isTrainer ? "/progress" : null,
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="chart.line.uptrend.xyaxis"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

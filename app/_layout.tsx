import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "../src/presentation/contexts/AuthProvider";
import { DependencyProvider } from "../src/presentation/providers/DependencyProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * RootLayout con Clean Architecture
 *
 * Estructura jerárquica de providers:
 * 1. DependencyProvider: Inyección de dependencias
 * 2. AuthProvider: Estado de autenticación y perfil del usuario
 * 3. ThemeProvider: Tema de navegación
 */
export default function RootLayout() {
  console.log("🟡 RootLayout - Iniciando layout principal");

  return (
    <DependencyProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="trainer" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </DependencyProvider>
  );
}

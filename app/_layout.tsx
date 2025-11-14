import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../src/presentation/contexts/AuthContext";
import { DependencyProvider } from "../src/presentation/providers/DependencyProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * RootLayout con Clean Architecture
 *
 * Estructura jerárquica de providers:
 * 1. DependencyProvider: Inyección de dependencias
 * 2. AuthProvider: Estado de autenticación
 * 3. ThemeProvider: Tema de navegación
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DependencyProvider>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="trainer" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </DependencyProvider>
  );
}

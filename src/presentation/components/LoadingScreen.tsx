import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingScreenProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
}

/**
 * LoadingScreen - Componente reutilizable para pantallas de carga
 */
export function LoadingScreen({
  message = "Cargando...",
  size = "large",
  color = "#3b82f6",
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

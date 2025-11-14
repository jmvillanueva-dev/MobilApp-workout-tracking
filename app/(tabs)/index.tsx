import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../src/presentation/components";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

/**
 * Pantalla Principal - Dashboard del usuario
 */
export default function HomeScreen() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  if (!usuario) {
    // AuthRedirect en index.tsx principal manejará la redirección
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>¡Bienvenido de vuelta!</Text>
        <Text style={styles.subtitle}>
          Hola, {usuario.full_name || usuario.email}
        </Text>
        <Text style={styles.role}>
          Rol: {usuario.role === "entrenador" ? "Entrenador" : "Usuario"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  role: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../src/presentation/components";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

/**
 * Pantalla Explorar - Descubrir rutinas y ejercicios
 */
export default function ExploreScreen() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen message="Cargando rutinas..." />;
  }

  if (!usuario) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rutinas</Text>
        <Text style={styles.subtitle}>
          Descubre nuevas rutinas y ejercicios
        </Text>
        <Text style={styles.placeholder}>
          Aquí podrás explorar:
          {"\n"}• Rutinas populares
          {"\n"}• Ejercicios recomendados
          {"\n"}• Entrenamientos destacados
          {"\n"}• Programas personalizados
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  },
  placeholder: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
});

import { router } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

/**
 * Componente Crear - Pantalla para crear contenido (solo entrenadores)
 */
export default function CrearScreen() {
  const { usuario, cargando, esEntrenador } = useAuth();

  useEffect(() => {
    // Verificar autenticación cuando el componente se monta
    if (!cargando) {
      if (!usuario) {
        // Usuario no autenticado: redirigir a login
        router.replace("/auth/login");
      } else if (!esEntrenador) {
        // Usuario autenticado pero no es entrenador: redirigir a tabs principales
        router.replace("/(tabs)");
      }
    }
  }, [usuario, cargando, esEntrenador]);

  // Mostrar loading mientras verifica autenticación
  if (cargando) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  // Si no es entrenador o no está autenticado, no mostrar contenido
  // (la redirección se maneja en useEffect)
  if (!usuario || !esEntrenador) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Crear Contenido
        </Text>
        <Text style={{ marginTop: 16, textAlign: "center" }}>
          Pantalla para entrenadores - Aquí podrás crear rutinas, ejercicios,
          etc.
        </Text>
      </View>
    </SafeAreaView>
  );
}

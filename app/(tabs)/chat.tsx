import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../src/presentation/components";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

/**
 * Pantalla Chat - Comunicación con entrenadores y comunidad
 */
export default function ChatScreen() {
  const { usuario, cargando, esEntrenador } = useAuth();

  if (cargando) {
    return <LoadingScreen message="Cargando chat..." />;
  }

  if (!usuario) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>
          {esEntrenador
            ? "Comunícate con tus usuarios"
            : "Habla con tu entrenador y la comunidad"}
        </Text>
        <Text style={styles.placeholder}>
          {esEntrenador
            ? "Como entrenador podrás:\n• Responder consultas de usuarios\n• Enviar motivación y consejos\n• Crear grupos de entrenamiento\n• Compartir tips fitness"
            : "Como usuario podrás:\n• Consultar a tu entrenador\n• Unirte a grupos de entrenamiento\n• Compartir tu progreso\n• Conectar con otros usuarios"}
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

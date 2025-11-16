import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  const menuOptions = [
    {
      title: "Ver Mis Planes",
      description: "Visualiza y gestiona los planes de entrenamiento creados",
      action: () => router.push("/trainer/mis-planes"),
      color: "#4CAF50",
      icon: "📋",
    },
    {
      title: "Crear Plan",
      description: "Crea un nuevo plan de entrenamiento para tus clientes",
      action: () => router.push("/trainer/crear-plan"),
      color: "#2196F3",
      icon: "➕",
    },
    {
      title: "Crear Rutina",
      description: "Diseña nuevas rutinas de ejercicios",
      action: () => router.push("/trainer/crear-rutina"),
      color: "#FF9800",
      icon: "🏋️",
    },
    {
      title: "Crear Ejercicio",
      description: "Agrega nuevos ejercicios a la base de datos",
      action: () => router.push("/trainer/crear-ejercicio"),
      color: "#9C27B0",
      icon: "💪",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Entrenador</Text>
        <Text style={styles.subtitle}>Bienvenido, {usuario?.fullName}</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: option.color }]}
            onPress={option.action}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{option.icon}</Text>
                <Text style={styles.cardTitle}>{option.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{option.description}</Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Gestiona tu contenido de entrenamiento desde aquí
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  arrow: {
    marginLeft: 16,
  },
  arrowText: {
    fontSize: 20,
    color: "#ccc",
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

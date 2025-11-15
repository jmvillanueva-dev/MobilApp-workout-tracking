import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthProvider";

/**
 * Componente de debug temporal para diagnosticar problemas
 */
export function DebugScreen() {
  const authContext = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🔍 Debug Screen</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Auth:</Text>
          <Text style={styles.debugText}>
            Cargando: {authContext.cargando ? "SÍ" : "NO"}
          </Text>
          <Text style={styles.debugText}>
            Usuario: {authContext.usuario ? "SÍ" : "NO"}
          </Text>
          <Text style={styles.debugText}>
            Es Entrenador: {authContext.esEntrenador ? "SÍ" : "NO"}
          </Text>
          <Text style={styles.debugText}>
            Es Usuario: {authContext.esUsuario ? "SÍ" : "NO"}
          </Text>
        </View>

        {authContext.usuario && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del Usuario:</Text>
            <Text style={styles.debugText}>ID: {authContext.usuario.id}</Text>
            <Text style={styles.debugText}>
              Email: {authContext.usuario.email}
            </Text>
            <Text style={styles.debugText}>
              Nombre: {authContext.usuario.full_name}
            </Text>
            <Text style={styles.debugText}>
              Rol: {authContext.usuario.role}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Variables de Entorno:</Text>
          <Text style={styles.debugText}>
            SUPABASE_URL:{" "}
            {process.env.EXPO_PUBLIC_SUPABASE_URL
              ? "Configurada"
              : "NO configurada"}
          </Text>
          <Text style={styles.debugText}>
            SUPABASE_KEY:{" "}
            {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
              ? "Configurada"
              : "NO configurada"}
          </Text>
        </View>

        <Text style={styles.note}>
          📝 Esta pantalla es temporal para debugging. Revisa la consola para
          logs detallados.
        </Text>
      </ScrollView>
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#1f2937",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  debugText: {
    fontSize: 14,
    fontFamily: "monospace",
    marginBottom: 8,
    color: "#6b7280",
  },
  note: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 24,
  },
});

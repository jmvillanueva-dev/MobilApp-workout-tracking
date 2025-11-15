import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../src/presentation/components";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

/**
 * Pantalla Principal - Dashboard del usuario
 */
export default function HomeScreen() {
  const { usuario, cargando, cerrarSesion } = useAuth();

  /**
   * Navegar al perfil del usuario
   */
  const irAPerfil = () => {
    router.push("/(tabs)/profile");
  };

  /**
   * Manejar cierre de sesión
   */
  const handleCerrarSesion = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              const resultado = await cerrarSesion();
              if (!resultado.success) {
                Alert.alert("Error", "No se pudo cerrar la sesión");
              }
              // La navegación se maneja automáticamente en el auth listener
            } catch {
              Alert.alert("Error", "No se pudo cerrar la sesión");
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  if (!usuario) {
    // AuthRedirect en index.tsx principal manejará la redirección
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Avatar y nombre */}
        <TouchableOpacity style={styles.userInfo} onPress={irAPerfil}>
          <Image
            source={{
              uri: usuario.avatar_url
                ? usuario.avatar_url
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    usuario.full_name || usuario.email?.charAt(0) || "U"
                  )}&size=100&background=007AFF&color=fff`,
            }}
            style={styles.headerAvatar}
          />
          <View style={styles.userTextInfo}>
            <Text style={styles.userName}>
              {usuario.full_name || usuario.email}
            </Text>
            <Text style={styles.userRole}>
              {usuario.role === "entrenador" ? "Entrenador" : "Usuario"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutIconButton}
          onPress={handleCerrarSesion}
        >
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            color="#dc3545"
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.welcome}>¡Bienvenido de vuelta!</Text>
        <Text style={styles.subtitle}>¿Qué quieres hacer hoy?</Text>

        {/* Aquí puedes agregar el contenido principal de la app */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Contenido principal de la aplicación
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutIconButton: {
    padding: 8,
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
    marginBottom: 32,
    textAlign: "center",
  },
  placeholder: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});

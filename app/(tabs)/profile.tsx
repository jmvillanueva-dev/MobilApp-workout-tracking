import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useProfile } from "../../src/presentation/hooks";

/**
 * Pantalla de Perfil
 */
export default function ProfileScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const {
    cargando,
    error,
    actualizarPerfil,
    seleccionarAvatarGaleria,
    tomarFotoAvatar,
    limpiarError,
  } = useProfile();

  const [nombre, setNombre] = useState(usuario?.full_name || "");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Para forzar re-render del Image

  // Sincronizar el estado local con los datos del usuario (solo al montar o cambiar usuario)
  useEffect(() => {
    if (usuario) {
      setNombre(usuario.full_name || "");
      setAvatarUri(null); // Limpiar para mostrar la imagen del servidor
      setAvatarError(false);
      setAvatarLoading(false);
      setAvatarKey((prev) => prev + 1); // Incrementar key para forzar re-render
    }
  }, [usuario]); // Depende del usuario completo

  /**
   * Maneja la selección de avatar desde galería
   */
  const handleSeleccionarAvatar = async () => {
    const resultado = await seleccionarAvatarGaleria();
    if (resultado.success && resultado.asset) {
      setAvatarUri(resultado.asset.uri);
    } else if (resultado.error && resultado.error !== "canceled") {
      Alert.alert("Error", resultado.message || "Error al seleccionar imagen");
    }
  };

  /**
   * Maneja tomar foto para avatar
   */
  const handleTomarFoto = async () => {
    const resultado = await tomarFotoAvatar();
    if (resultado.success && resultado.asset) {
      setAvatarUri(resultado.asset.uri);
    } else if (resultado.error && resultado.error !== "canceled") {
      Alert.alert("Error", resultado.message || "Error al tomar foto");
    }
  };

  /**
   * Maneja el cierre de sesión
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

  /**
   * Maneja la actualización del perfil
   */
  const handleActualizarPerfil = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es requerido");
      return;
    }

    const updateData: any = {
      full_name: nombre.trim(),
    };

    // Solo incluir avatar si se seleccionó uno nuevo
    if (avatarUri) {
      updateData.avatarUri = avatarUri;
    }

    const resultado = await actualizarPerfil(updateData);

    if (resultado.success) {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      // Limpiar la URI local para forzar el uso de la nueva imagen del servidor
      setAvatarUri(null);
      setAvatarError(false); // Resetear error para intentar cargar nueva imagen
      setAvatarKey((prev) => prev + 1); // Forzar re-render del avatar
    } else {
      Alert.alert("Error", resultado.error || "Error al actualizar perfil");
    }
  };

  /**
   * Muestra opciones para avatar
   */
  const mostrarOpcionesAvatar = () => {
    Alert.alert("Cambiar Avatar", "Selecciona una opción", [
      { text: "Tomar Foto", onPress: handleTomarFoto },
      { text: "Seleccionar de Galería", onPress: handleSeleccionarAvatar },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  if (!usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Cerrando sesión...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      {/* Avatar */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={mostrarOpcionesAvatar}
      >
        {!avatarError && (
          <>
            {avatarLoading && (
              <View style={[styles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
            <Image
              source={{
                uri: avatarUri
                  ? avatarUri
                  : usuario.avatar_url && usuario.avatar_url.length > 0
                  ? `${usuario.avatar_url}?cache=${avatarKey}` // Usar avatarKey para cache busting
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      usuario.full_name || usuario.email?.charAt(0) || "U"
                    )}&size=200&background=007AFF&color=fff`,
                cache: "reload", // Forzar recarga de la imagen
              }}
              style={[styles.avatar, avatarLoading && { opacity: 0 }]}
              key={`avatar-${avatarKey}`} // Key único que se incrementa con cada cambio
              onLoadStart={() => {
                setAvatarLoading(true);
                setAvatarError(false);
              }}
              onLoad={() => {
                setAvatarLoading(false);
                setAvatarError(false);
              }}
              onError={() => {
                setAvatarLoading(false);
                setAvatarError(true);
              }}
            />
          </>
        )}
        {avatarError && (
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                usuario.full_name || usuario.email?.charAt(0) || "U"
              )}&size=200&background=007AFF&color=fff`,
            }}
            style={styles.avatar}
            key={`fallback-${usuario.id}`}
          />
        )}
        <Text style={styles.changeAvatarText}>Cambiar Foto</Text>
      </TouchableOpacity>

      {/* Campo de nombre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ingresa tu nombre de usuario"
          editable={!cargando}
        />
      </View>

      {/* Información del usuario */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>
          <IconSymbol name="envelope.fill" color="#b6b5b5ff" />
        </Text>
        <Text style={styles.infoText}>{usuario.email}</Text>
      </View>

      {/* Mensaje de error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={limpiarError}>
            <Text style={styles.clearErrorText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de actualizar */}
      <TouchableOpacity
        style={[styles.updateButton, cargando && styles.disabledButton]}
        onPress={handleActualizarPerfil}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.updateButtonText}>Actualizar Perfil</Text>
        )}
      </TouchableOpacity>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleCerrarSesion}
      >
        <IconSymbol
          name="rectangle.portrait.and.arrow.right"
          color="white"
          size={20}
        />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },
  loadingAvatar: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorAvatar: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffebee",
  },
  errorAvatarText: {
    fontSize: 24,
  },
  errorAvatarSmall: {
    fontSize: 10,
    color: "#c62828",
    marginTop: 2,
  },
  changeAvatarText: {
    marginTop: 8,
    color: "#007AFF",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#c62828",
    flex: 1,
  },
  clearErrorText: {
    color: "#1976d2",
    fontWeight: "500",
  },
  updateButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

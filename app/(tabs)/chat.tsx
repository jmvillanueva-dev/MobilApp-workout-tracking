import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LoadingScreen,
  MessageBubble,
  MessageInput,
  TypingIndicator,
} from "../../src/presentation/components";
import { useAuth, useChat } from "../../src/presentation/hooks";

/**
 * Pantalla Chat General - Chat público para todos los usuarios
 */
export default function ChatScreen() {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const {
    mensajes,
    estadoTyping,
    cargandoMensajes,
    enviandoMensaje,
    error,
    enviarMensaje,
    actualizarTyping,
    cargarMensajes,
    limpiarError,
  } = useChat();

  // Cargar mensajes al iniciar
  useEffect(() => {
    if (cargarMensajes && usuario) {
      cargarMensajes();
    }
  }, [cargarMensajes, usuario]);

  // Estados de carga
  if (cargandoAuth) {
    return <LoadingScreen message="Cargando chat..." />;
  }

  if (!usuario) {
    return null;
  }

  const manejarEnvioMensaje = async (contenido: string) => {
    const resultado = await enviarMensaje({
      content: contenido,
    });

    if (!resultado.success && resultado.error) {
      Alert.alert("Error", resultado.error);
    }
  };

  const manejarCambioTyping = async (isTyping: boolean) => {
    if (actualizarTyping) {
      await actualizarTyping(isTyping);
    }
  };

  // Mostrar error si existe
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={limpiarError}>
            <Text style={styles.errorButton}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💬 Chat General</Text>
        <Text style={styles.subtitle}>Comparte tus ideas con la comunidad</Text>
      </View>

      {/* Lista de mensajes */}
      <View style={styles.messagesContainer}>
        {cargandoMensajes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : mensajes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💭</Text>
            <Text style={styles.emptyTitle}>¡Sé el primero en escribir!</Text>
            <Text style={styles.emptyText}>
              Comparte tus pensamientos, haz preguntas o saluda a la comunidad.
            </Text>
          </View>
        ) : (
          <FlatList
            data={mensajes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              // Debug: verificar datos del mensaje
              console.log("🔍 Renderizando mensaje:", {
                id: item.id,
                sender_id: item.sender_id,
                sender_name: item.sender_name,
                current_user_id: usuario.id,
                isCurrentUser: item.sender_id === usuario.id,
              });

              return (
                <View style={styles.messageContainer}>
                  {/* Mostrar nombre del remitente si no es el usuario actual */}
                  {item.sender_id !== usuario.id && (
                    <Text style={styles.senderName}>
                      {item.sender_name || "Usuario sin nombre"}
                    </Text>
                  )}
                  <MessageBubble
                    message={item}
                    isCurrentUser={item.sender_id === usuario.id}
                  />
                </View>
              );
            }}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => (
              <TypingIndicator typingStatus={estadoTyping} />
            )}
          />
        )}
      </View>

      {/* Input para escribir mensajes */}
      <MessageInput
        onSendMessage={manejarEnvioMensaje}
        onTypingChange={manejarCambioTyping}
        disabled={enviandoMensaje}
        placeholder="Escribe algo a la comunidad..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messageContainer: {
    marginBottom: 8,
  },
  senderName: {
    fontSize: 12,
    color: "#6c757d",
    marginLeft: 16,
    marginBottom: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 16,
    textAlign: "center",
  },
  errorButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});

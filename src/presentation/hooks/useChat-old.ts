import { useCallback, useEffect, useState } from "react";
import {
  Conversation,
  CreateMessageRequest,
  Message,
  TypingStatus,
} from "../../domain/models/Message";
import { useAuth } from "../contexts/AuthProvider";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * useChat - Hook personalizado para manejo de chat
 *
 * Proporciona funcionalidades de:
 * - Gestión de conversaciones
 * - Envío y recepción de mensajes
 * - Estado de "escribiendo" en tiempo real
 * - Suscripciones a eventos en tiempo real
 */
export function useChat() {
  // Estados del chat
  const [conversaciones, setConversaciones] = useState<Conversation[]>([]);
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [estadoTyping, setEstadoTyping] = useState<TypingStatus | null>(null);
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(
    null
  );

  // Estados de carga y errores
  const [cargandoConversaciones, setCargandoConversaciones] = useState(false);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dependencias
  const { messageUseCase } = useDependencies();
  const { usuario } = useAuth();

  /**
   * Cargar todas las conversaciones del usuario
   */
  const cargarConversaciones = useCallback(async () => {
    if (!usuario) return;

    setCargandoConversaciones(true);
    setError(null);

    try {
      const resultado = await messageUseCase.obtenerMisConversaciones();

      if (resultado.success) {
        setConversaciones(resultado.data || []);
      } else {
        setError(resultado.error || "Error al cargar conversaciones");
      }
    } catch (error: any) {
      setError("Error inesperado al cargar conversaciones");
      console.error("❌ Error cargando conversaciones:", error);
    } finally {
      setCargandoConversaciones(false);
    }
  }, [usuario, messageUseCase]);

  /**
   * Cargar mensajes de una conversación específica
   * @param otherUserId - ID del otro usuario
   * @param limit - Límite de mensajes
   * @param offset - Offset para paginación
   */
  const cargarMensajes = useCallback(
    async (otherUserId: string, limit = 50, offset = 0) => {
      if (!usuario) return;

      setCargandoMensajes(true);
      setError(null);

      try {
        const resultado = await messageUseCase.obtenerMensajesConversacion(
          otherUserId,
          limit,
          offset
        );

        if (resultado.success) {
          const mensajesOrdenados = (resultado.data || []).reverse(); // Mostrar más recientes al final

          if (offset === 0) {
            setMensajes(mensajesOrdenados);
          } else {
            // Agregar mensajes más antiguos al inicio
            setMensajes((prev) => [...mensajesOrdenados, ...prev]);
          }

          // Establecer conversación activa
          setConversacionActiva(otherUserId);
        } else {
          setError(resultado.error || "Error al cargar mensajes");
        }
      } catch (error: any) {
        setError("Error inesperado al cargar mensajes");
        console.error("❌ Error cargando mensajes:", error);
      } finally {
        setCargandoMensajes(false);
      }
    },
    [usuario, messageUseCase]
  );

  /**
   * Enviar un nuevo mensaje
   * @param messageData - Datos del mensaje
   */
  const enviarMensaje = useCallback(
    async (messageData: CreateMessageRequest) => {
      if (!usuario) {
        setError("Usuario no autenticado");
        return { success: false, error: "Usuario no autenticado" };
      }

      setEnviandoMensaje(true);
      setError(null);

      try {
        const resultado = await messageUseCase.enviarMensaje(messageData);

        if (resultado.success && resultado.data) {
          // Agregar mensaje a la lista local inmediatamente
          setMensajes((prev) => [...prev, resultado.data!]);

          // Actualizar conversaciones (mover al inicio)
          setConversaciones((prev) => {
            const updated = prev.filter(
              (conv) => conv.participant_id !== messageData.receiver_id
            );
            return [
              {
                participant_id: messageData.receiver_id,
                participant_name: resultado.data!.receiver_name || "Usuario",
                participant_avatar: resultado.data!.receiver_avatar,
                participant_role: "usuario", // TODO: Obtener rol real
                last_message: resultado.data,
                unread_count: 0,
                updated_at: resultado.data!.created_at,
              },
              ...updated,
            ];
          });
        } else {
          setError(resultado.error || "Error al enviar mensaje");
        }

        return resultado;
      } catch (error: any) {
        const errorMessage = "Error inesperado al enviar mensaje";
        setError(errorMessage);
        console.error("❌ Error enviando mensaje:", error);
        return { success: false, error: errorMessage };
      } finally {
        setEnviandoMensaje(false);
      }
    },
    [usuario, messageUseCase]
  );

  /**
   * Actualizar estado de "escribiendo"
   * @param conversationWith - ID del usuario con quien está conversando
   * @param isTyping - Si está escribiendo o no
   */
  const actualizarTyping = useCallback(
    async (conversationWith: string, isTyping: boolean) => {
      if (!usuario) return;

      try {
        await messageUseCase.actualizarEstadoEscribiendo(
          conversationWith,
          isTyping
        );
      } catch (error: any) {
        console.error("❌ Error actualizando typing:", error);
      }
    },
    [usuario, messageUseCase]
  );

  /**
   * Iniciar una nueva conversación
   * @param userId - ID del usuario con quien iniciar la conversación
   */
  const iniciarConversacion = useCallback(
    async (userId: string) => {
      await cargarMensajes(userId);
    },
    [cargarMensajes]
  );

  /**
   * Limpiar estado de error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cerrar conversación activa
   */
  const cerrarConversacion = useCallback(() => {
    setConversacionActiva(null);
    setMensajes([]);
    setEstadoTyping(null);
  }, []);

  // Efecto para cargar conversaciones al montar el componente
  useEffect(() => {
    if (usuario) {
      cargarConversaciones();
    }
  }, [usuario, cargarConversaciones]);

  // Efecto para suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!usuario) return;

    const unsubscribe = messageUseCase.suscribirseAMensajes(
      (nuevoMensaje: Message) => {
        // Solo agregar mensaje si es para el usuario actual (como receptor) o es de él (como emisor)
        if (
          nuevoMensaje.receiver_id === usuario.id ||
          nuevoMensaje.sender_id === usuario.id
        ) {
          setMensajes((prev) => {
            // Evitar duplicados
            const existe = prev.find((m) => m.id === nuevoMensaje.id);
            if (existe) return prev;

            return [...prev, nuevoMensaje];
          });

          // Actualizar conversaciones
          cargarConversaciones();
        }
      }
    );

    return unsubscribe;
  }, [usuario, messageUseCase, cargarConversaciones]);

  // Efecto para suscribirse a estado de typing cuando hay conversación activa
  useEffect(() => {
    if (!usuario || !conversacionActiva) return;

    const unsubscribe = messageUseCase.suscribirseAEstadoEscribiendo(
      conversacionActiva,
      (typingStatus: TypingStatus | null) => {
        setEstadoTyping(typingStatus);
      }
    );

    return unsubscribe;
  }, [usuario, conversacionActiva, messageUseCase]);

  return {
    // Estado
    conversaciones,
    mensajes,
    estadoTyping,
    conversacionActiva,

    // Estados de carga
    cargandoConversaciones,
    cargandoMensajes,
    enviandoMensaje,

    // Error
    error,

    // Acciones
    cargarConversaciones,
    cargarMensajes,
    enviarMensaje,
    actualizarTyping,
    iniciarConversacion,
    cerrarConversacion,
    limpiarError,
  };
}

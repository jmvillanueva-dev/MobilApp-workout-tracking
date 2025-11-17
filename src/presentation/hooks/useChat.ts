import { useCallback, useEffect, useState } from "react";
import {
  CreateMessageRequest,
  Message,
  TypingStatus,
} from "../../domain/models/Message";
import { useAuth } from "../contexts/AuthProvider";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * useChat - Hook personalizado para chat general simplificado
 *
 * Proporciona funcionalidades de:
 * - Gestión de mensajes del chat general
 * - Envío y recepción de mensajes
 * - Estado de "escribiendo" en tiempo real
 * - Suscripciones a eventos en tiempo real
 */
export function useChat() {
  // Estados del chat
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [estadoTyping, setEstadoTyping] = useState<TypingStatus | null>(null);

  // Estados de carga y errores
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dependencias
  const { messageUseCase } = useDependencies();
  const { usuario } = useAuth();

  /**
   * Cargar todos los mensajes del chat general
   */
  const cargarMensajes = useCallback(async () => {
    if (!usuario || !messageUseCase) return;

    setCargandoMensajes(true);
    setError(null);

    try {
      const resultado = await messageUseCase.obtenerMensajes();

      if (resultado.success && resultado.data) {
        setMensajes(resultado.data);
      } else {
        setError(resultado.error || "Error al cargar mensajes");
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      setError("Error inesperado al cargar mensajes");
    } finally {
      setCargandoMensajes(false);
    }
  }, [usuario, messageUseCase]);

  /**
   * Enviar un mensaje al chat general
   */
  const enviarMensaje = useCallback(
    async (request: CreateMessageRequest) => {
      if (!usuario || !messageUseCase) {
        return { success: false, error: "Usuario no autenticado" };
      }

      setEnviandoMensaje(true);
      setError(null);

      try {
        const resultado = await messageUseCase.enviarMensaje(request);

        if (resultado.success && resultado.data) {
          // Agregar el mensaje nuevo a la lista
          setMensajes((prevMensajes) => [...prevMensajes, resultado.data!]);

          // Limpiar el estado de typing del usuario actual
          setEstadoTyping((prev) => {
            if (prev && prev.user_id === usuario.id) {
              return null;
            }
            return prev;
          });

          return { success: true };
        } else {
          const mensajeError = resultado.error || "Error al enviar mensaje";
          setError(mensajeError);
          return { success: false, error: mensajeError };
        }
      } catch (err) {
        console.error("Error al enviar mensaje:", err);
        const mensajeError = "Error inesperado al enviar mensaje";
        setError(mensajeError);
        return { success: false, error: mensajeError };
      } finally {
        setEnviandoMensaje(false);
      }
    },
    [usuario, messageUseCase]
  );

  /**
   * Actualizar estado de typing del usuario actual con debounce
   */
  const actualizarTyping = useCallback(
    async (isTyping: boolean) => {
      if (!usuario || !messageUseCase) return;

      try {
        // Agregar un pequeño delay para evitar múltiples llamadas
        await new Promise((resolve) => setTimeout(resolve, 100));
        await messageUseCase.actualizarEstadoTyping(isTyping);
      } catch (err) {
        console.error("Error al actualizar estado de typing:", err);
        // Ignorar errores de typing para no afectar UX
      }
    },
    [usuario, messageUseCase]
  );

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Configurar suscripciones en tiempo real
   */
  useEffect(() => {
    if (!usuario || !messageUseCase) return;

    let cleanup: (() => void) | undefined;

    const configurarSuscripciones = async () => {
      try {
        console.log("🔄 Iniciando suscripción a mensajes...");

        // Configurar suscripción a nuevos mensajes
        const cleanupMessages = await messageUseCase.suscribirseAMensajes(
          (mensaje) => {
            console.log("🔔 Nuevo mensaje recibido:", mensaje);
            setMensajes((prevMensajes) => {
              // Evitar duplicados
              const existe = prevMensajes.some((m) => m.id === mensaje.id);
              if (existe) return prevMensajes;

              return [...prevMensajes, mensaje];
            });
          }
        );

        // Configurar suscripción a cambios de typing
        const cleanupTyping = await messageUseCase.suscribirseATyping(
          (typing) => {
            console.log("⌨️ Estado de typing actualizado:", typing);

            // Solo mostrar typing de otros usuarios
            if (typing && typing.user_id !== usuario.id) {
              setEstadoTyping(typing.is_typing ? typing : null);
            }
          }
        );

        // Combinar cleanup functions
        cleanup = () => {
          console.log("🔄 Cancelando suscripción a mensajes...");
          cleanupMessages?.();
          cleanupTyping?.();
        };
      } catch (err) {
        console.error("Error al configurar suscripciones:", err);
      }
    };

    configurarSuscripciones();

    // Cargar mensajes iniciales
    cargarMensajes();

    return () => {
      cleanup?.();
    };
  }, [usuario, messageUseCase, cargarMensajes]);

  return {
    // Estados
    mensajes,
    estadoTyping,

    // Estados de carga
    cargandoMensajes,
    enviandoMensaje,
    error,

    // Funciones
    enviarMensaje,
    actualizarTyping,
    cargarMensajes,
    limpiarError,
  };
}

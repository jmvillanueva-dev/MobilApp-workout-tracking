import { useCallback, useEffect, useState } from "react";
import {
  CreateMessageRequest,
  Message,
  TypingStatus,
} from "../../domain/models/Message";
import { useAuth } from "../contexts/AuthProvider";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * useChat - Hook personalizado para chat simple
 *
 * Proporciona funcionalidades de:
 * - Gestión de mensajes generales
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
   * Cargar todos los mensajes dirigidos al usuario actual
   */
  const cargarMensajes = useCallback(async () => {
    if (!usuario) return;

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
   * Enviar un mensaje
   */
  const enviarMensaje = useCallback(
    async (request: CreateMessageRequest) => {
      if (!usuario) {
        return { success: false, error: "Usuario no autenticado" };
      }

      setEnviandoMensaje(true);
      setError(null);

      try {
        const resultado = await messageUseCase.enviarMensaje(request);

        if (resultado.success && resultado.data) {
          // Agregar el mensaje nuevo a la lista
          setMensajes((prevMensajes) => [...prevMensajes, resultado.data!]);
          
          // Limpiar el estado de typing
          setEstadoTyping(null);

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
   * Actualizar estado de typing
   */
  const actualizarTyping = useCallback(
    async (targetUserId: string, isTyping: boolean) => {
      if (!usuario) return;

      try {
        await messageUseCase.actualizarEstadoTyping({
          target_user_id: targetUserId,
          is_typing: isTyping,
        });
      } catch (err) {
        console.error("Error al actualizar estado de typing:", err);
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
    if (!usuario) return;

    let cleanup: (() => void) | undefined;

    // Configurar suscripción a nuevos mensajes
    const configurarSuscripciones = async () => {
      try {
        cleanup = await messageUseCase.suscribirseAMensajes((mensaje) => {
          console.log("Nuevo mensaje recibido:", mensaje);
          setMensajes((prevMensajes) => {
            // Evitar duplicados
            const existe = prevMensajes.some((m) => m.id === mensaje.id);
            if (existe) return prevMensajes;
            
            return [...prevMensajes, mensaje];
          });
        });

        // También suscribirse a cambios de typing
        const cleanupTyping = await messageUseCase.suscribirseATyping((typing) => {
          console.log("Estado de typing actualizado:", typing);
          setEstadoTyping(typing);
        });

        // Combinar cleanup functions
        const originalCleanup = cleanup;
        cleanup = () => {
          originalCleanup?.();
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
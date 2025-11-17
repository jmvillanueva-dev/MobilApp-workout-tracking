import {
  CreateMessageRequest,
  MessagesResponse,
  SendMessageResponse,
  TypingResponse,
} from "../models/Message";

/**
 * Interfaz para el repositorio de mensajes simplificado
 * Define las operaciones de persistencia para el chat general
 */
export interface IMessageRepository {
  /**
   * Obtiene todos los mensajes del chat general
   * @param limit - Número máximo de mensajes (opcional)
   * @param offset - Offset para paginación (opcional)
   * @returns Lista de mensajes ordenados por fecha
   */
  obtenerMensajes(
    limit?: number,
    offset?: number
  ): Promise<MessagesResponse>;

  /**
   * Envía un nuevo mensaje al chat general
   * @param messageData - Datos del mensaje
   * @returns Confirmación del envío y datos del mensaje creado
   */
  enviarMensaje(
    messageData: CreateMessageRequest
  ): Promise<SendMessageResponse>;

  /**
   * Actualiza el estado de "escribiendo" del usuario actual
   * @param isTyping - Si está escribiendo o no
   * @returns Estado actualizado
   */
  actualizarEstadoTyping(
    isTyping: boolean
  ): Promise<TypingResponse>;

  /**
   * Suscribirse a mensajes en tiempo real
   * @param callback - Función que se ejecuta cuando llega un nuevo mensaje
   * @returns Función para cancelar la suscripción
   */
  suscribirseAMensajes(
    callback: (message: any) => void
  ): Promise<() => void>;

  /**
   * Suscribirse a cambios en estado de typing
   * @param callback - Función que se ejecuta cuando cambia el estado
   * @returns Función para cancelar la suscripción
   */
  suscribirseATyping(
    callback: (typing: any) => void
  ): Promise<() => void>;
}
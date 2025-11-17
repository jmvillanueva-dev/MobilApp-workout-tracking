import {
  CreateMessageRequest,
  MessagesResponse,
  SendMessageResponse,
  TypingResponse,
} from "../models/Message";
import { IAuthRepository } from "../repositories/IAuthRepository";
import { IMessageRepository } from "../repositories/IMessageRepository";

/**
 * MessageUseCase - Caso de Uso de Mensajería Simplificado
 *
 * Contiene la lógica de negocio para el sistema de chat general.
 * Maneja la validación, autorización y coordinación entre repositorios.
 */
export class MessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private authRepository: IAuthRepository
  ) {}

  /**
   * Obtiene todos los mensajes del chat general
   */
  async obtenerMensajes(
    limit?: number,
    offset?: number
  ): Promise<MessagesResponse> {
    try {
      // Verificar autenticación
      const user = await this.authRepository.getCurrentUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      return await this.messageRepository.obtenerMensajes(limit, offset);
    } catch (error: any) {
      console.error("❌ Error en caso de uso - obtener mensajes:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía un nuevo mensaje al chat general
   * @param messageData - Datos del mensaje
   */
  async enviarMensaje(
    messageData: CreateMessageRequest
  ): Promise<SendMessageResponse> {
    try {
      // Verificar autenticación
      const user = await this.authRepository.getCurrentUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      // Validar contenido
      if (!messageData.content?.trim()) {
        return { success: false, error: "El mensaje no puede estar vacío" };
      }

      // Validar longitud del mensaje
      if (messageData.content.trim().length > 1000) {
        return { success: false, error: "El mensaje es demasiado largo (máximo 1000 caracteres)" };
      }

      return await this.messageRepository.enviarMensaje(messageData);
    } catch (error: any) {
      console.error("❌ Error en caso de uso - enviar mensaje:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualiza el estado de "escribiendo" del usuario actual
   * @param isTyping - Si el usuario está escribiendo
   */
  async actualizarEstadoTyping(isTyping: boolean): Promise<TypingResponse> {
    try {
      // Verificar autenticación
      const user = await this.authRepository.getCurrentUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      return await this.messageRepository.actualizarEstadoTyping(isTyping);
    } catch (error: any) {
      console.error("❌ Error en caso de uso - actualizar typing:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  async suscribirseAMensajes(
    callback: (message: any) => void
  ): Promise<() => void> {
    try {
      return await this.messageRepository.suscribirseAMensajes(callback);
    } catch (error: any) {
      console.error("❌ Error suscribiéndose a mensajes:", error);
      // Retornar función vacía si hay error
      return () => {};
    }
  }

  /**
   * Suscribirse a cambios en estado de typing
   */
  async suscribirseATyping(
    callback: (typing: any) => void
  ): Promise<() => void> {
    try {
      return await this.messageRepository.suscribirseATyping(callback);
    } catch (error: any) {
      console.error("❌ Error suscribiéndose a typing:", error);
      // Retornar función vacía si hay error
      return () => {};
    }
  }
}
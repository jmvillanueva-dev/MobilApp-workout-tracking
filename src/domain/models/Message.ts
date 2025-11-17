/**
 * Tipos de mensaje soportados
 */
export type MessageType = "text" | "image" | "file";

/**
 * Interfaz Message (Entidad de Dominio)
 *
 * Representa un mensaje en el chat general
 */
export interface Message {
  id: number;
  sender_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
  updated_at: string;

  // Datos del remitente para mostrar en UI (se obtienen por JOIN)
  sender_name?: string;
  sender_avatar?: string;
}

/**
 * Interfaz para crear un nuevo mensaje
 */
export interface CreateMessageRequest {
  content: string;
  message_type?: MessageType;
}

/**
 * Interfaz para el estado de "escribiendo" simplificado
 */
export interface TypingStatus {
  id?: number;
  user_id: string;
  is_typing: boolean;
  updated_at: string;

  // Datos del usuario para mostrar en UI
  user_name?: string;
  user_avatar?: string;
}

/**
 * Respuesta para listar mensajes
 */
export interface MessagesResponse {
  success: boolean;
  data?: Message[];
  error?: string;
}

/**
 * Respuesta para enviar mensaje
 */
export interface SendMessageResponse {
  success: boolean;
  data?: Message;
  error?: string;
}

/**
 * Respuesta para actualizar estado de typing
 */
export interface TypingResponse {
  success: boolean;
  data?: TypingStatus;
  error?: string;
}

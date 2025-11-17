import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateMessageRequest,
  Message,
  MessagesResponse,
  SendMessageResponse,
  TypingResponse,
  TypingStatus,
} from "../../domain/models/Message";
import { IMessageRepository } from "../../domain/repositories/IMessageRepository";

/**
 * Implementación del repositorio de mensajes usando Supabase
 *
 * Chat simplificado - todos los mensajes son públicos
 */
export class SupabaseMessageRepository implements IMessageRepository {
  constructor(private supabase: SupabaseClient) {}

  async obtenerMensajes(
    limit: number = 50,
    offset: number = 0
  ): Promise<MessagesResponse> {
    try {
      // Obtener usuario actual
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      console.log("📨 Obtener mensajes - Query completa con sender");

      // DEBUGGING: Verificar perfiles existentes
      const { data: profilesCheck } = await this.supabase
        .from("profiles")
        .select("id, full_name, role")
        .limit(5);

      console.log("👥 Muestra de perfiles en BD:", profilesCheck);

      // Obtener todos los mensajes del chat general
      const { data, error } = await this.supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url, role
          )
        `
        )
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error obteniendo mensajes:", error);
        return { success: false, error: error.message };
      }

      console.log("🔍 Raw data recibida:", {
        totalMessages: data?.length || 0,
        sampleMessage: data?.[0]
          ? {
              id: data[0].id,
              sender_id: data[0].sender_id,
              sender: data[0].sender,
              hasSender: !!data[0].sender,
              senderFullName: data[0].sender?.full_name,
            }
          : null,
      });

      // Formatear los mensajes con información del remitente
      const formattedMessages: Message[] = (data || []).map(
        (msg: any, index: number) => {
          console.log(`🔍 Procesando mensaje ${index + 1}:`, {
            id: msg.id,
            sender_id: msg.sender_id,
            hasSenderObject: !!msg.sender,
            senderObject: msg.sender,
            senderFullName: msg.sender?.full_name,
            senderRole: msg.sender?.role,
          });

          const formattedMessage = {
            id: msg.id,
            sender_id: msg.sender_id,
            content: msg.content,
            message_type: msg.message_type || "text",
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            sender_name: msg.sender?.full_name || "Usuario",
            sender_avatar: msg.sender?.avatar_url,
          };

          console.log("📨 Mensaje formateado:", {
            id: formattedMessage.id,
            sender_id: formattedMessage.sender_id,
            sender_name: formattedMessage.sender_name,
            sender_avatar: formattedMessage.sender_avatar,
            content: formattedMessage.content.substring(0, 30) + "...",
          });

          // Verificar si falta información del sender
          if (!msg.sender || !msg.sender.full_name) {
            console.warn("⚠️ MENSAJE SIN SENDER INFO:", {
              messageId: msg.id,
              senderId: msg.sender_id,
              senderObject: msg.sender,
            });
          }

          return formattedMessage;
        }
      );

      return { success: true, data: formattedMessages };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      return { success: false, error: error.message };
    }
  }

  async enviarMensaje(
    messageData: CreateMessageRequest
  ): Promise<SendMessageResponse> {
    try {
      // Obtener usuario actual
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      // Validar contenido
      if (!messageData.content?.trim()) {
        return { success: false, error: "El mensaje no puede estar vacío" };
      }

      // Insertar mensaje
      const { data, error } = await this.supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          content: messageData.content.trim(),
          message_type: messageData.message_type || "text",
        })
        .select(
          `
          *,
          sender:profiles!messages_sender_id_fkey(
            id, full_name, avatar_url, role
          )
        `
        )
        .single();

      if (error) {
        console.error("❌ Error enviando mensaje:", error);
        return { success: false, error: error.message };
      }

      // Formatear mensaje de respuesta
      const formattedMessage: Message = {
        id: data.id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: data.message_type,
        created_at: data.created_at,
        updated_at: data.updated_at,
        sender_name: data.sender?.full_name || "Usuario",
        sender_avatar: data.sender?.avatar_url,
      };

      return { success: true, data: formattedMessage };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      return { success: false, error: error.message };
    }
  }

  async actualizarEstadoTyping(isTyping: boolean): Promise<TypingResponse> {
    try {
      // Obtener usuario actual
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      // Actualizar o insertar estado de typing con manejo de conflictos
      const { data, error } = await this.supabase
        .from("typing_status")
        .upsert(
          {
            user_id: user.id,
            is_typing: isTyping,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .select(
          `
          *,
          user:profiles!typing_status_user_id_fkey(
            id, full_name, avatar_url
          )
        `
        )
        .maybeSingle();

      // Manejar errores de duplicación silenciosamente
      if (error) {
        console.warn("⚠️ Warning actualizando typing:", error.message);

        // Si es error de duplicación, intentar solo update
        if (error.code === "23505") {
          const { data: updateData, error: updateError } = await this.supabase
            .from("typing_status")
            .update({
              is_typing: isTyping,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .select(
              `
              *,
              user:profiles!typing_status_user_id_fkey(
                id, full_name, avatar_url
              )
            `
            )
            .maybeSingle();

          if (updateError) {
            console.error("❌ Error en update de typing:", updateError);
            return { success: false, error: updateError.message };
          }

          if (updateData) {
            const formattedTyping: TypingStatus = {
              id: updateData.id,
              user_id: updateData.user_id,
              is_typing: updateData.is_typing,
              updated_at: updateData.updated_at,
              user_name: updateData.user?.full_name || "Usuario",
              user_avatar: updateData.user?.avatar_url,
            };

            return { success: true, data: formattedTyping };
          }
        }

        return { success: false, error: error.message };
      }

      if (data) {
        const formattedTyping: TypingStatus = {
          id: data.id,
          user_id: data.user_id,
          is_typing: data.is_typing,
          updated_at: data.updated_at,
          user_name: data.user?.full_name || "Usuario",
          user_avatar: data.user?.avatar_url,
        };

        return { success: true, data: formattedTyping };
      }

      return { success: true };
    } catch (error: any) {
      console.error("❌ Error inesperado en typing:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  async suscribirseAMensajes(
    callback: (message: Message) => void
  ): Promise<() => void> {
    const subscription = this.supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("🔔 Nuevo mensaje recibido:", payload);

          // Verificar que payload.new existe y tiene id
          if (!payload.new || !payload.new.id) {
            console.warn("⚠️ Payload inválido recibido:", payload);
            return;
          }

          // Obtener datos completos del mensaje con información del sender
          const { data, error } = await this.supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey(
                id, full_name, avatar_url, role
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            console.log("🔍 Datos completos del mensaje realtime:", {
              id: data.id,
              sender_id: data.sender_id,
              hasSenderObject: !!data.sender,
              senderObject: data.sender,
              senderFullName: data.sender?.full_name,
              senderRole: data.sender?.role,
            });

            const formattedMessage: Message = {
              id: data.id,
              sender_id: data.sender_id,
              content: data.content,
              message_type: data.message_type,
              created_at: data.created_at,
              updated_at: data.updated_at,
              sender_name: data.sender?.full_name || "Usuario",
              sender_avatar: data.sender?.avatar_url,
            };

            console.log("📨 Mensaje formateado para realtime:", {
              id: formattedMessage.id,
              sender_id: formattedMessage.sender_id,
              sender_name: formattedMessage.sender_name,
              sender_avatar: formattedMessage.sender_avatar,
              content: formattedMessage.content.substring(0, 30) + "...",
            });

            // Verificar si falta información del sender en realtime
            if (!data.sender || !data.sender.full_name) {
              console.warn("⚠️ MENSAJE REALTIME SIN SENDER INFO:", {
                messageId: data.id,
                senderId: data.sender_id,
                senderObject: data.sender,
              });
            }

            callback(formattedMessage);
          } else {
            console.error(
              "❌ Error obteniendo datos completos del mensaje:",
              error
            );
          }
        }
      )
      .subscribe();

    // Retornar función de cleanup
    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Suscribirse a cambios en estado de typing
   */
  async suscribirseATyping(
    callback: (typing: TypingStatus) => void
  ): Promise<() => void> {
    const subscription = this.supabase
      .channel("typing-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "typing_status",
        },
        async (payload) => {
          console.log("⌨️ Estado de typing actualizado:", payload);

          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;

          // Solo procesar si alguien está escribiendo
          if (newRecord?.is_typing) {
            // Obtener datos completos del usuario
            const { data, error } = await this.supabase
              .from("typing_status")
              .select(
                `
                *,
                user:profiles!typing_status_user_id_fkey(
                  id, full_name, avatar_url
                )
              `
              )
              .eq("id", newRecord.id)
              .single();

            if (!error && data) {
              const formattedTyping: TypingStatus = {
                id: data.id,
                user_id: data.user_id,
                is_typing: data.is_typing,
                updated_at: data.updated_at,
                user_name: data.user?.full_name || "Usuario",
                user_avatar: data.user?.avatar_url,
              };

              console.log("⌨️ Typing formateado:", formattedTyping);
              callback(formattedTyping);
            }
          } else {
            // Si ya no está escribiendo, enviar estado null
            callback({
              user_id: oldRecord?.user_id || newRecord?.user_id,
              is_typing: false,
              updated_at: new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

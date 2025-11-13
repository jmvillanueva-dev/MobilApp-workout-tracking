import { supabase } from "../../data/services/supabaseClient";
import { Profile, ProfileUpdateData } from "../models/User";

/**
 * ProfileUseCase - Caso de Uso de Perfil
 *
 * Lógica de negocio para 'profiles'.
 * NO interactúa con ImagePicker, solo recibe una URI.
 */
export class ProfileUseCase {
  /**
   * (Privado) Sube un avatar a Supabase Storage
   *
   * @param uri - URI local del archivo
   * @param userId - ID del usuario (para la ruta del archivo)
   * @returns URL pública de la imagen subida
   */
  private async subirAvatar(uri: string, userId: string): Promise<string> {
    try {
      // 1. Leer archivo usando fetch
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      // 2. Definir extensión y tipo de contenido.
      // Asumimos 'jpg' ya que 'expo-image-picker' con quality < 1
      // (usamos 0.8) casi siempre comprime a JPEG.
      const fileExt = "jpg";
      const contentType = "image/jpeg";

      // 3. Generar nombre de archivo único y compatible con RLS
      // Ruta: 'avatars/USER_ID/TIMESTAMP.jpg'
      const filePath = `${userId}/${new Date().getTime()}.${fileExt}`;

      // 4. Subir a Supabase Storage (bucket 'avatars')
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // 5. Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error al subir avatar:", error);
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario actualmente autenticado.
   *
   * @param updates - Objeto con los datos a actualizar
   * @returns El perfil actualizado
   */
  async actualizarMiPerfil(updates: ProfileUpdateData) {
    try {
      // 1. Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // 2. Preparar objeto de actualización para la DB
      const dbUpdates: Partial<Omit<Profile, "id" | "role">> = {};

      // 3. Si se incluyó una 'avatarUri', subirla primero
      if (updates.avatarUri) {
        const publicUrl = await this.subirAvatar(updates.avatarUri, user.id);
        dbUpdates.avatar_url = publicUrl;
      }

      // 4. Añadir el nombre si se proporcionó
      if (updates.full_name !== undefined) {
        dbUpdates.full_name = updates.full_name;
      }

      // 5. Validar si hay algo que actualizar
      if (Object.keys(dbUpdates).length === 0) {
        return {
          success: true,
          data: null,
          message: "No hay nada que actualizar.",
        };
      }

      // 6. Realizar la actualización en la tabla 'profiles'
      const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", user.id)
        .select() // devuelve los datos actualizados
        .single();

      if (error) throw error;

      return { success: true, data: data as Profile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener el perfil público de CUALQUIER usuario por su ID
   *
   * @param userId - El ID del usuario (UUID)
   * @returns El perfil público
   */
  async obtenerPerfilPorId(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return { success: true, data: data as Profile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

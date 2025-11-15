import { SupabaseClient } from "@supabase/supabase-js";
import { IFileRepository } from "../../domain/repositories/IFileRepository";

/**
 * Implementación del repositorio de archivos usando Supabase Storage
 */
export class SupabaseFileRepository implements IFileRepository {
  constructor(private supabase: SupabaseClient) {}

  async subirAvatar(uri: string, userId: string, fileName?: string) {
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
      // Ruta: 'USER_ID/TIMESTAMP.jpg' o usar fileName si se proporciona
      const finalFileName = fileName || `${new Date().getTime()}.${fileExt}`;
      const filePath = `${userId}/${finalFileName}`;

      // 4. Subir a Supabase Storage (bucket 'avatars')
      const { data, error } = await this.supabase.storage
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
      } = this.supabase.storage.from("avatars").getPublicUrl(data.path);

      // 6. Limpiar URL para evitar dobles barras
      const cleanUrl = publicUrl
        .replace(/\/+/g, "/")
        .replace("http:/", "http://")
        .replace("https:/", "https://");

      return { success: true, data: cleanUrl };
    } catch (error: any) {
      console.error("Error al subir avatar:", error);
      return { success: false, error: error.message };
    }
  }

  async eliminarArchivo(filePath: string) {
    try {
      const { error } = await this.supabase.storage
        .from("avatars")
        .remove([filePath]);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error("Error al eliminar archivo:", error);
      return { success: false, error: error.message };
    }
  }
}

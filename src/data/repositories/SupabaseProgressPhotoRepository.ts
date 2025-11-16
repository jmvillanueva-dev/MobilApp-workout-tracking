import * as FileSystem from "expo-file-system";
import {
  CreateProgressPhotoRequest,
  ProgressPhoto,
  UpdateProgressPhotoRequest,
} from "../../domain/models";
import { IProgressPhotoRepository } from "../../domain/repositories";
import { supabase } from "../services/supabaseClient";

/**
 * SupabaseProgressPhotoRepository - Implementación concreta para fotos de progreso
 *
 * Maneja todas las operaciones relacionadas con fotos de progreso y Supabase Storage.
 */
export class SupabaseProgressPhotoRepository
  implements IProgressPhotoRepository
{
  private readonly BUCKET_NAME = "progress-photos";

  /**
   * Obtener fotos del usuario
   */
  async obtenerPorUsuario(
    userId: string,
    type?: "front" | "side" | "back" | "custom"
  ): Promise<{ success: boolean; data?: ProgressPhoto[]; error?: string }> {
    try {
      let query = supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", userId)
        .order("taken_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error obteniendo fotos de progreso:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: true, data: [] };
      }

      const photos: ProgressPhoto[] = data.map((photo: any) => ({
        id: photo.id,
        userId: photo.user_id,
        imageUrl: photo.image_url,
        type: photo.type,
        notes: photo.notes,
        weight: photo.weight,
        bodyFatPercentage: photo.body_fat_percentage,
        takenAt: new Date(photo.taken_at),
        createdAt: new Date(photo.created_at),
        updatedAt: new Date(photo.updated_at),
        measurements: photo.measurements || undefined,
      }));

      return { success: true, data: photos };
    } catch (error) {
      console.error("Error inesperado obteniendo fotos de progreso:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Subir nueva foto de progreso
   */
  async subirFoto(
    request: CreateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }> {
    try {
      // 1. Generar nombre único para la imagen
      const timestamp = new Date().getTime();
      const fileExtension = request.imageUri.split(".").pop() || "jpg";
      const fileName = `${request.userId}/${request.type}_${timestamp}.${fileExtension}`;

      // 2. Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(request.imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Convertir base64 a blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${fileExtension}` });

      // 4. Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        return { success: false, error: uploadError.message };
      }

      // 5. Obtener URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      // 6. Crear registro en la base de datos
      const { data: dbData, error: dbError } = await supabase
        .from("progress_photos")
        .insert({
          user_id: request.userId,
          image_url: urlData.publicUrl,
          type: request.type,
          notes: request.notes,
          weight: request.weight,
          body_fat_percentage: request.bodyFatPercentage,
          taken_at: new Date(),
          measurements: request.measurements,
        })
        .select("*")
        .single();

      if (dbError) {
        console.error("Error creando registro de foto:", dbError);

        // Intentar limpiar archivo subido si falló el registro
        await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);

        return { success: false, error: dbError.message };
      }

      const photo: ProgressPhoto = {
        id: dbData.id,
        userId: dbData.user_id,
        imageUrl: dbData.image_url,
        type: dbData.type,
        notes: dbData.notes,
        weight: dbData.weight,
        bodyFatPercentage: dbData.body_fat_percentage,
        takenAt: new Date(dbData.taken_at),
        createdAt: new Date(dbData.created_at),
        updatedAt: new Date(dbData.updated_at),
        measurements: dbData.measurements || undefined,
      };

      return { success: true, data: photo };
    } catch (error) {
      console.error("Error inesperado subiendo foto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualizar datos de foto existente
   */
  async actualizar(
    request: UpdateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .update({
          notes: request.notes,
          weight: request.weight,
          body_fat_percentage: request.bodyFatPercentage,
          measurements: request.measurements,
          updated_at: new Date(),
        })
        .eq("id", request.id)
        .select("*")
        .single();

      if (error) {
        console.error("Error actualizando foto de progreso:", error);
        return { success: false, error: error.message };
      }

      const photo: ProgressPhoto = {
        id: data.id,
        userId: data.user_id,
        imageUrl: data.image_url,
        type: data.type,
        notes: data.notes,
        weight: data.weight,
        bodyFatPercentage: data.body_fat_percentage,
        takenAt: new Date(data.taken_at),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        measurements: data.measurements || undefined,
      };

      return { success: true, data: photo };
    } catch (error) {
      console.error("Error inesperado actualizando foto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener URL firmada para imagen privada (si se necesita)
   */
  async obtenerUrlFirmada(
    path: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error("Error generando URL firmada:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data.signedUrl };
    } catch (error) {
      console.error("Error inesperado generando URL firmada:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Eliminar foto de progreso
   */
  async eliminar(
    userId: string,
    photoId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Obtener información de la foto para eliminar archivo
      const { data: photoData, error: fetchError } = await supabase
        .from("progress_photos")
        .select("image_url, user_id")
        .eq("id", photoId)
        .eq("user_id", userId) // Verificación de seguridad
        .single();

      if (fetchError) {
        console.error("Error obteniendo foto para eliminar:", fetchError);
        return { success: false, error: fetchError.message };
      }

      // 2. Extraer path del archivo de la URL
      const url = new URL(photoData.image_url);
      const pathParts = url.pathname.split(`/${this.BUCKET_NAME}/`);
      const filePath = pathParts[1];

      // 3. Eliminar archivo de Storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([filePath]);

        if (storageError) {
          console.warn(
            "Advertencia eliminando archivo de storage:",
            storageError
          );
          // Continúa eliminando el registro aunque falle eliminar el archivo
        }
      }

      // 4. Eliminar registro de la base de datos
      const { error: deleteError } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photoId)
        .eq("user_id", userId); // Verificación de seguridad

      if (deleteError) {
        console.error("Error eliminando registro de foto:", deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error inesperado eliminando foto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

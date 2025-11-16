import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../data/services/supabaseClient";
import {
  imageUriToBytes,
  pickPhotoFromGallery,
  takePhotoWithCamera,
} from "../utils/imageUtils";

interface ProgressPhoto {
  id: number;
  user_id: string;
  photo_url: string;
  created_at: string;
}

export const useSimpleProgressPhotos = (userId?: string) => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener fotos del usuario
  const fetchPhotos = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      console.log("📸 Fotos cargadas desde DB:", data?.length || 0, data);
      setPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fotos");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subir foto a Storage y guardar URL en la tabla
  const uploadPhoto = useCallback(
    async (imageUri: string) => {
      if (!userId) return { success: false, error: "Usuario requerido" };

      setUploading(true);
      setError(null);

      try {
        // 1. Generar nombre único para la foto
        const timestamp = Date.now();
        const fileExtension = imageUri.split(".").pop() || "jpg";
        const fileName = `${userId}/progress_${timestamp}.${fileExtension}`;

        // 2. Convertir imagen a bytes usando utilidad sin warnings
        const bytesResult = await imageUriToBytes(imageUri);
        if (!bytesResult.success || !bytesResult.data) {
          throw new Error(bytesResult.error || "Error al procesar imagen");
        }
        const byteArray = bytesResult.data;

        // 4. Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("progress-photos")
          .upload(fileName, byteArray, {
            contentType: `image/${fileExtension}`,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Error subiendo foto: ${uploadError.message}`);
        }

        // 5. Obtener URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("progress-photos").getPublicUrl(fileName);

        console.log("📸 URL pública generada:", publicUrl);

        // 6. Guardar URL en la tabla progress_photos
        const { data: photoData, error: insertError } = await supabase
          .from("progress_photos")
          .insert({
            user_id: userId,
            photo_url: publicUrl,
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Error guardando en tabla: ${insertError.message}`);
        }

        // 7. Actualizar lista local
        console.log("📸 Foto subida exitosamente:", photoData);
        console.log("📸 URL pública:", publicUrl);
        setPhotos((prev) => {
          console.log("📸 Fotos antes:", prev.length);
          const newPhotos = [photoData, ...prev];
          console.log("📸 Fotos después:", newPhotos.length);
          return newPhotos;
        });

        return { success: true, data: photoData };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al subir foto";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setUploading(false);
      }
    },
    [userId]
  );

  // Eliminar foto
  const deletePhoto = useCallback(
    async (photoId: number, photoUrl: string) => {
      if (!userId) return { success: false, error: "Usuario requerido" };

      try {
        // 1. Eliminar de la tabla
        const { error: deleteError } = await supabase
          .from("progress_photos")
          .delete()
          .eq("id", photoId)
          .eq("user_id", userId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // 2. Eliminar de Storage (opcional, extraer path de la URL)
        try {
          const urlParts = photoUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `${userId}/${fileName}`;

          await supabase.storage.from("progress-photos").remove([filePath]);
        } catch (storageError) {
          console.warn("Error eliminando de storage:", storageError);
          // No fallar si no se puede eliminar del storage
        }

        // 3. Actualizar lista local
        setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al eliminar foto";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [userId]
  );

  // Tomar foto con cámara
  const takePhoto = useCallback(async () => {
    const result = await takePhotoWithCamera();

    if (result.success && result.uri) {
      return await uploadPhoto(result.uri);
    }

    return { success: false, error: result.error || "Error al tomar foto" };
  }, [uploadPhoto]);

  // Seleccionar foto de galería
  const pickPhoto = useCallback(async () => {
    const result = await pickPhotoFromGallery();

    if (result.success && result.uri) {
      return await uploadPhoto(result.uri);
    }

    return {
      success: false,
      error: result.error || "Error al seleccionar foto",
    };
  }, [uploadPhoto]);

  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }
  }, [fetchPhotos, userId]);

  return {
    photos,
    loading,
    uploading,
    error,
    fetchPhotos,
    uploadPhoto,
    deletePhoto,
    takePhoto,
    pickPhoto,
  };
};

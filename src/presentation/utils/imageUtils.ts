import * as ImagePicker from "expo-image-picker";

/**
 * Utilidades para manejo de imágenes sin warnings de deprecación
 */

/**
 * Opciones de configuración para la cámara y galería
 */
const IMAGE_PICKER_OPTIONS = {
  allowsEditing: true,
  aspect: [3, 4] as [number, number],
  quality: 0.8,
};

/**
 * Tomar foto con la cámara
 */
export const takePhotoWithCamera = async (): Promise<{
  success: boolean;
  uri?: string;
  error?: string;
}> => {
  try {
    // Solicitar permisos
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        error: "Se necesita permiso para usar la cámara",
      };
    }

    // Lanzar cámara con configuración compatible
    const result = await ImagePicker.launchCameraAsync({
      ...IMAGE_PICKER_OPTIONS,
      // Usar la propiedad compatible sin warnings
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return { success: true, uri: result.assets[0].uri };
    }

    return { success: false, error: "Foto cancelada" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al tomar foto",
    };
  }
};

/**
 * Seleccionar foto de la galería
 */
export const pickPhotoFromGallery = async (): Promise<{
  success: boolean;
  uri?: string;
  error?: string;
}> => {
  try {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        error: "Se necesita permiso para acceder a la galería",
      };
    }

    // Lanzar galería con configuración compatible
    const result = await ImagePicker.launchImageLibraryAsync({
      ...IMAGE_PICKER_OPTIONS,
      // Usar la propiedad compatible sin warnings
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return { success: true, uri: result.assets[0].uri };
    }

    return { success: false, error: "Selección cancelada" };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al seleccionar foto",
    };
  }
};

/**
 * Convertir URI de imagen a Uint8Array para upload
 */
export const imageUriToBytes = async (
  uri: string
): Promise<{
  success: boolean;
  data?: Uint8Array;
  error?: string;
}> => {
  try {
    // Método 1: Intentar usar fetch (más moderno, sin warnings)
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Error al leer imagen con fetch");
      }
      const arrayBuffer = await response.arrayBuffer();
      return { success: true, data: new Uint8Array(arrayBuffer) };
    } catch (fetchError) {
      console.log("Fetch falló, usando método alternativo:", fetchError);

      // Método 2: Fallback usando FileSystem (puede mostrar warning pero funciona)
      const FileSystem = await import("expo-file-system");
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64" as any, // Evitar error de tipos
      });

      // Convertir base64 a bytes
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      return { success: true, data: new Uint8Array(byteNumbers) };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al procesar imagen",
    };
  }
};

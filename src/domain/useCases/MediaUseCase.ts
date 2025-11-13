import * as ImagePicker from "expo-image-picker";

// Opciones de configuración para el selector de imágenes
interface ImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}

// Respuesta estandarizada de este UseCase
type MediaPickerResponse = {
  success: boolean;
  asset: ImagePicker.ImagePickerAsset | null;
  error: "permissions" | "canceled" | "unknown" | null;
  message?: string;
};

/**
 * MediaUseCase - Caso de Uso de Medios
 *
 * Encapsula toda la lógica para interactuar con la cámara
 * y la galería del dispositivo usando 'expo-image-picker'.
 * Es reutilizable por cualquier otro UseCase o ViewModel
 * que necesite seleccionar una imagen.
 */
export class MediaUseCase {
  /**
   * (Privado) Función genérica para lanzar el selector de galería
   */
  private async seleccionarImagen(
    options: ImagePickerOptions
  ): Promise<MediaPickerResponse> {
    // 1. Pedir permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        asset: null,
        error: "permissions",
        message: "Se necesitan permisos para acceder a la galería.",
      };
    }

    // 2. Lanzar galería
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
      });

      if (result.canceled) {
        return { success: false, asset: null, error: "canceled" };
      }

      return { success: true, asset: result.assets[0], error: null };
    } catch (error: any) {
      return {
        success: false,
        asset: null,
        error: "unknown",
        message: error.message,
      };
    }
  }

  /**
   * (Privado) Función genérica para lanzar la cámara
   */
  private async tomarFoto(
    options: ImagePickerOptions
  ): Promise<MediaPickerResponse> {
    // 1. Pedir permisos
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return {
        success: false,
        asset: null,
        error: "permissions",
        message: "Se necesitan permisos para usar la cámara.",
      };
    }

    // 2. Lanzar cámara
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
      });

      if (result.canceled) {
        return { success: false, asset: null, error: "canceled" };
      }

      return { success: true, asset: result.assets[0], error: null };
    } catch (error: any) {
      return {
        success: false,
        asset: null,
        error: "unknown",
        message: error.message,
      };
    }
  }

  // --- MÉTODOS PÚBLICOS ---

  /**
   * Selecciona una foto de la galería para un AVATAR (aspecto 1:1)
   */
  async seleccionarAvatarGaleria(): Promise<MediaPickerResponse> {
    return this.seleccionarImagen({ aspect: [1, 1], quality: 0.8 });
  }

  /**
   * Toma una foto con la cámara para un AVATAR (aspecto 1:1)
   */
  async tomarFotoAvatar(): Promise<MediaPickerResponse> {
    return this.tomarFoto({ aspect: [1, 1], quality: 0.8 });
  }

  /**
   * Selecciona una foto de la galería para contenido general
   * (ej: posts, ejercicios) (aspecto 4:3)
   */
  async seleccionarImagenGaleria(): Promise<MediaPickerResponse> {
    return this.seleccionarImagen({ aspect: [4, 3], quality: 0.8 });
  }

  /**
   * Toma una foto con la cámara para contenido general (aspecto 4:3)
   */
  async tomarFotoCamara(): Promise<MediaPickerResponse> {
    return this.tomarFoto({ aspect: [4, 3], quality: 0.8 });
  }
}

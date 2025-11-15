/**
 * Interfaz para el repositorio de archivos/multimedia
 * Define las operaciones para el manejo de archivos (imágenes, videos, etc.)
 */
export interface IFileRepository {
  /**
   * Sube un archivo (avatar) al storage
   * @param uri - URI local del archivo
   * @param userId - ID del usuario (para organizar archivos)
   * @param fileName - Nombre del archivo (opcional)
   * @returns URL pública del archivo subido
   */
  subirAvatar(
    uri: string,
    userId: string,
    fileName?: string
  ): Promise<{
    success: boolean;
    data?: string; // URL pública
    error?: string;
  }>;

  /**
   * Sube un video al storage
   * @param uri - URI local del video
   * @param fileName - Nombre del archivo
   * @returns URL pública del video subido
   */
  subirVideo(
    uri: string,
    fileName: string
  ): Promise<{
    success: boolean;
    data?: string; // URL pública
    error?: string;
  }>;

  /**
   * Elimina un archivo del storage
   * @param filePath - Ruta del archivo a eliminar
   */
  eliminarArchivo(filePath: string): Promise<{
    success: boolean;
    error?: string;
  }>;
}

import {
  CreateProgressPhotoRequest,
  ProgressPhoto,
  UpdateProgressPhotoRequest,
} from "../models";

/**
 * IProgressPhotoRepository - Interface para el repositorio de fotos de progreso
 *
 * Define las operaciones CRUD para progress photos.
 */
export interface IProgressPhotoRepository {
  /**
   * Obtener fotos del usuario
   */
  obtenerPorUsuario(
    userId: string,
    type?: "front" | "side" | "back" | "custom"
  ): Promise<{ success: boolean; data?: ProgressPhoto[]; error?: string }>;

  /**
   * Subir nueva foto de progreso
   */
  subirFoto(
    request: CreateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }>;

  /**
   * Actualizar datos de foto existente
   */
  actualizar(
    request: UpdateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }>;

  /**
   * Obtener URL firmada para imagen privada
   */
  obtenerUrlFirmada(
    path: string,
    expiresIn?: number
  ): Promise<{ success: boolean; data?: string; error?: string }>;

  /**
   * Eliminar foto de progreso
   */
  eliminar(
    userId: string,
    photoId: number
  ): Promise<{ success: boolean; error?: string }>;
}

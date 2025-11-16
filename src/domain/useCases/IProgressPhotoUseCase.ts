import {
  CreateProgressPhotoRequest,
  ProgressPhoto,
  UpdateProgressPhotoRequest,
} from "../models";

// Las interfaces CreateProgressPhotoRequest y UpdateProgressPhotoRequest
// se definen en ../models/Progress.ts para evitar duplicaciones

/**
 * ProgressPhotoWithComparison - Foto con datos de comparación
 */
export interface ProgressPhotoWithComparison extends ProgressPhoto {
  previousPhoto?: ProgressPhoto;
  weightDifference?: number;
  daysDifference?: number;
  progressPercentage?: number;
}

/**
 * ProgressStats - Estadísticas de progreso
 */
export interface ProgressStats {
  totalPhotos: number;
  firstPhotoDate?: Date;
  latestPhotoDate?: Date;
  weightProgress?: {
    initial: number;
    current: number;
    difference: number;
    trend: "gaining" | "losing" | "maintaining";
  };
  consistencyScore: number; // 0-100
  averagePhotoFrequency: number; // días entre fotos
}

/**
 * IProgressPhotoUseCase - Casos de uso para fotos de progreso
 *
 * Define la lógica de negocio para el manejo de fotos de progreso y seguimiento.
 */
export interface IProgressPhotoUseCase {
  /**
   * Subir nueva foto de progreso
   */
  subirFotoProgreso(
    request: CreateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }>;

  /**
   * Actualizar datos de foto existente
   */
  actualizarFotoProgreso(
    request: UpdateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }>;

  /**
   * Obtener fotos del usuario con comparación
   */
  obtenerFotosConComparacion(
    userId: string,
    type?: "front" | "side" | "back" | "custom"
  ): Promise<{
    success: boolean;
    data?: ProgressPhotoWithComparison[];
    error?: string;
  }>;

  /**
   * Obtener foto más reciente por tipo
   */
  obtenerUltimaFoto(
    userId: string,
    type: "front" | "side" | "back" | "custom"
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }>;

  /**
   * Generar comparación entre dos fotos específicas
   */
  compararFotos(
    photoId1: number,
    photoId2: number
  ): Promise<{
    success: boolean;
    data?: {
      photo1: ProgressPhoto;
      photo2: ProgressPhoto;
      weightDifference: number;
      daysDifference: number;
      measurementChanges?: {
        chest?: number;
        waist?: number;
        hips?: number;
        bicep?: number;
        thigh?: number;
        neck?: number;
      };
    };
    error?: string;
  }>;

  /**
   * Obtener estadísticas de progreso
   */
  obtenerEstadisticasProgreso(
    userId: string
  ): Promise<{ success: boolean; data?: ProgressStats; error?: string }>;

  /**
   * Eliminar foto de progreso
   */
  eliminarFoto(
    userId: string,
    photoId: number
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Obtener timeline de progreso (ordenado por fecha)
   */
  obtenerTimelineProgreso(
    userId: string,
    limite?: number
  ): Promise<{
    success: boolean;
    data?: ProgressPhotoWithComparison[];
    error?: string;
  }>;
}

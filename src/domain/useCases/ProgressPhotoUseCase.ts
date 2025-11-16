import {
  CreateProgressPhotoRequest,
  ProgressPhoto,
  UpdateProgressPhotoRequest,
} from "../models";
import { IProgressPhotoRepository } from "../repositories";
import { IProgressPhotoUseCase } from "./IProgressPhotoUseCase";

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
 * ProgressPhotoUseCase - Implementación concreta para casos de uso de fotos de progreso
 *
 * Maneja la lógica de negocio para el manejo de fotos de progreso y seguimiento.
 */
export class ProgressPhotoUseCase implements IProgressPhotoUseCase {
  constructor(private progressPhotoRepository: IProgressPhotoRepository) {}

  /**
   * Subir nueva foto de progreso
   */
  async subirFotoProgreso(
    request: CreateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }> {
    try {
      // Validaciones de negocio
      if (!request.userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!request.imageUri) {
        return { success: false, error: "URI de imagen requerida" };
      }

      if (!request.type) {
        return { success: false, error: "Tipo de foto requerido" };
      }

      // Validar peso si se proporciona
      if (
        request.weight !== undefined &&
        (request.weight < 20 || request.weight > 300)
      ) {
        return {
          success: false,
          error: "Peso debe estar entre 20 y 300 kg",
        };
      }

      // Validar porcentaje de grasa corporal si se proporciona
      if (
        request.bodyFatPercentage !== undefined &&
        (request.bodyFatPercentage < 3 || request.bodyFatPercentage > 50)
      ) {
        return {
          success: false,
          error: "Porcentaje de grasa corporal debe estar entre 3% y 50%",
        };
      }

      const result = await this.progressPhotoRepository.subirFoto(request);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en subirFotoProgreso:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualizar datos de foto existente
   */
  async actualizarFotoProgreso(
    request: UpdateProgressPhotoRequest
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }> {
    try {
      if (!request.id) {
        return { success: false, error: "ID de foto requerido" };
      }

      // Validar peso si se proporciona
      if (
        request.weight !== undefined &&
        (request.weight < 20 || request.weight > 300)
      ) {
        return {
          success: false,
          error: "Peso debe estar entre 20 y 300 kg",
        };
      }

      // Validar porcentaje de grasa corporal si se proporciona
      if (
        request.bodyFatPercentage !== undefined &&
        (request.bodyFatPercentage < 3 || request.bodyFatPercentage > 50)
      ) {
        return {
          success: false,
          error: "Porcentaje de grasa corporal debe estar entre 3% y 50%",
        };
      }

      const result = await this.progressPhotoRepository.actualizar(request);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en actualizarFotoProgreso:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener fotos del usuario con comparación
   */
  async obtenerFotosConComparacion(
    userId: string,
    type?: "front" | "side" | "back" | "custom"
  ): Promise<{
    success: boolean;
    data?: ProgressPhotoWithComparison[];
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.progressPhotoRepository.obtenerPorUsuario(
        userId,
        type
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data || result.data.length === 0) {
        return { success: true, data: [] };
      }

      // Ordenar por fecha (más reciente primero)
      const sortedPhotos = result.data.sort(
        (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      );

      // Agregar datos de comparación
      const photosWithComparison: ProgressPhotoWithComparison[] =
        sortedPhotos.map((photo, index) => {
          const previousPhoto =
            index < sortedPhotos.length - 1
              ? sortedPhotos[index + 1]
              : undefined;

          let weightDifference: number | undefined;
          let daysDifference: number | undefined;
          let progressPercentage: number | undefined;

          if (previousPhoto) {
            // Diferencia de peso
            if (photo.weight && previousPhoto.weight) {
              weightDifference = photo.weight - previousPhoto.weight;
            }

            // Diferencia de días
            daysDifference = Math.ceil(
              (new Date(photo.takenAt).getTime() -
                new Date(previousPhoto.takenAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );

            // Porcentaje de progreso (simplificado)
            if (weightDifference !== undefined) {
              progressPercentage =
                (Math.abs(weightDifference) / (previousPhoto.weight || 1)) *
                100;
            }
          }

          return {
            ...photo,
            previousPhoto,
            weightDifference,
            daysDifference,
            progressPercentage,
          };
        });

      return {
        success: true,
        data: photosWithComparison,
      };
    } catch (error) {
      console.error("Error en obtenerFotosConComparacion:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener foto más reciente por tipo
   */
  async obtenerUltimaFoto(
    userId: string,
    type: "front" | "side" | "back" | "custom"
  ): Promise<{ success: boolean; data?: ProgressPhoto; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.progressPhotoRepository.obtenerPorUsuario(
        userId,
        type
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data || result.data.length === 0) {
        return { success: true, data: undefined };
      }

      // Obtener la más reciente
      const latestPhoto = result.data.sort(
        (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      )[0];

      return {
        success: true,
        data: latestPhoto,
      };
    } catch (error) {
      console.error("Error en obtenerUltimaFoto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Generar comparación entre dos fotos específicas
   */
  async compararFotos(
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
  }> {
    try {
      if (!photoId1 || !photoId2) {
        return { success: false, error: "IDs de fotos requeridos" };
      }

      if (photoId1 === photoId2) {
        return { success: false, error: "No se puede comparar la misma foto" };
      }

      // Por ahora, esta funcionalidad requeriría un método específico en el repositorio
      // que obtenga fotos por ID. Implementaremos una versión simplificada.
      return {
        success: false,
        error: "Funcionalidad de comparación específica no implementada aún",
      };
    } catch (error) {
      console.error("Error en compararFotos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener estadísticas de progreso
   */
  async obtenerEstadisticasProgreso(
    userId: string
  ): Promise<{ success: boolean; data?: ProgressStats; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.progressPhotoRepository.obtenerPorUsuario(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data || result.data.length === 0) {
        return {
          success: true,
          data: {
            totalPhotos: 0,
            consistencyScore: 0,
            averagePhotoFrequency: 0,
          },
        };
      }

      const photos = result.data.sort(
        (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
      );

      const totalPhotos = photos.length;
      const firstPhoto = photos[0];
      const latestPhoto = photos[photos.length - 1];

      // Progreso de peso
      let weightProgress;
      const firstWeight = firstPhoto.weight;
      const currentWeight = latestPhoto.weight;

      if (firstWeight && currentWeight) {
        const difference = currentWeight - firstWeight;
        let trend: "gaining" | "losing" | "maintaining" = "maintaining";

        if (Math.abs(difference) > 1) {
          trend = difference > 0 ? "gaining" : "losing";
        }

        weightProgress = {
          initial: firstWeight,
          current: currentWeight,
          difference,
          trend,
        };
      }

      // Frecuencia promedio de fotos
      let averagePhotoFrequency = 0;
      if (totalPhotos > 1) {
        const totalDays = Math.ceil(
          (new Date(latestPhoto.takenAt).getTime() -
            new Date(firstPhoto.takenAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        averagePhotoFrequency = totalDays / (totalPhotos - 1);
      }

      // Puntuación de consistencia (simplificada)
      const consistencyScore = Math.min(
        100,
        Math.max(0, 100 - (averagePhotoFrequency - 7) * 2)
      );

      const stats: ProgressStats = {
        totalPhotos,
        firstPhotoDate: new Date(firstPhoto.takenAt),
        latestPhotoDate: new Date(latestPhoto.takenAt),
        weightProgress,
        consistencyScore,
        averagePhotoFrequency,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error en obtenerEstadisticasProgreso:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Eliminar foto de progreso
   */
  async eliminarFoto(
    userId: string,
    photoId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!photoId) {
        return { success: false, error: "ID de foto requerido" };
      }

      const result = await this.progressPhotoRepository.eliminar(
        userId,
        photoId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error en eliminarFoto:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener timeline de progreso (ordenado por fecha)
   */
  async obtenerTimelineProgreso(
    userId: string,
    limite?: number
  ): Promise<{
    success: boolean;
    data?: ProgressPhotoWithComparison[];
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      // Obtener todas las fotos con comparación
      const result = await this.obtenerFotosConComparacion(userId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      let timeline = result.data || [];

      // Aplicar límite si se especifica
      if (limite && limite > 0) {
        timeline = timeline.slice(0, limite);
      }

      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      console.error("Error en obtenerTimelineProgreso:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

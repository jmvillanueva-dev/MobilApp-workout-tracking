import { useCallback, useState } from "react";
import { ProgressPhoto } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Estado para foto con comparación
 */
interface ProgressPhotoWithComparison extends ProgressPhoto {
  previousPhoto?: ProgressPhoto;
  weightDifference?: number;
  daysDifference?: number;
  progressPercentage?: number;
}

/**
 * Estado para estadísticas de progreso
 */
interface ProgressStats {
  totalPhotos: number;
  firstPhotoDate?: Date;
  latestPhotoDate?: Date;
  weightProgress?: {
    initial: number;
    current: number;
    difference: number;
    trend: "gaining" | "losing" | "maintaining";
  };
  consistencyScore: number;
  averagePhotoFrequency: number;
}

/**
 * Tipos de fotos soportados
 */
type PhotoType = "front" | "side" | "back" | "custom";

/**
 * Hook para manejar las fotos de progreso
 */
export const useProgressPhotos = (userId?: string) => {
  const { progressPhotoUseCase } = useDependencies();

  // Estados
  const [photos, setPhotos] = useState<ProgressPhotoWithComparison[]>([]);
  const [photosByType, setPhotosByType] = useState<
    Record<PhotoType, ProgressPhoto[]>
  >({
    front: [],
    side: [],
    back: [],
    custom: [],
  });
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [timeline, setTimeline] = useState<ProgressPhotoWithComparison[]>([]);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados de error
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  /**
   * Obtener todas las fotos con comparación
   */
  const fetchPhotos = useCallback(
    async (type?: PhotoType) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await progressPhotoUseCase.obtenerFotosConComparacion(
          userId,
          type
        );

        if (result.success) {
          const photosData = result.data || [];

          if (type) {
            // Actualizar fotos por tipo específico
            setPhotosByType((prev) => ({
              ...prev,
              [type]: photosData,
            }));
          } else {
            // Actualizar todas las fotos
            setPhotos(photosData);

            // Organizar por tipo
            const organized: Record<PhotoType, ProgressPhoto[]> = {
              front: [],
              side: [],
              back: [],
              custom: [],
            };

            photosData.forEach((photo) => {
              organized[photo.type].push(photo);
            });

            setPhotosByType(organized);
          }
        } else {
          setError(result.error || "Error obteniendo fotos");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, progressPhotoUseCase]
  );

  /**
   * Subir nueva foto de progreso
   */
  const uploadPhoto = useCallback(
    async (
      imageUri: string,
      type: PhotoType,
      notes?: string,
      weight?: number,
      bodyFatPercentage?: number,
      measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        bicep?: number;
        thigh?: number;
        neck?: number;
      }
    ) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await progressPhotoUseCase.subirFotoProgreso({
          userId,
          imageUri,
          type,
          notes,
          weight,
          bodyFatPercentage,
          measurements,
        });

        if (result.success && result.data) {
          // Refrescar las fotos después de subir
          await fetchPhotos();

          // Refrescar estadísticas
          fetchStats();
        } else {
          setUploadError(result.error || "Error subiendo foto");
        }

        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Error inesperado";
        setUploadError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsUploading(false);
      }
    },
    [userId, progressPhotoUseCase, fetchPhotos]
  );

  /**
   * Actualizar datos de foto existente
   */
  const updatePhoto = useCallback(
    async (
      photoId: number,
      notes?: string,
      weight?: number,
      bodyFatPercentage?: number,
      measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        bicep?: number;
        thigh?: number;
        neck?: number;
      }
    ) => {
      setIsUpdating(true);

      try {
        const result = await progressPhotoUseCase.actualizarFotoProgreso({
          id: photoId,
          notes,
          weight,
          bodyFatPercentage,
          measurements,
        });

        if (result.success) {
          // Refrescar las fotos después de actualizar
          await fetchPhotos();

          // Refrescar estadísticas si se cambió el peso
          if (weight !== undefined) {
            fetchStats();
          }
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Error actualizando foto",
        };
      } finally {
        setIsUpdating(false);
      }
    },
    [progressPhotoUseCase, fetchPhotos]
  );

  /**
   * Obtener la última foto de un tipo específico
   */
  const getLatestPhoto = useCallback(
    async (type: PhotoType) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      try {
        const result = await progressPhotoUseCase.obtenerUltimaFoto(
          userId,
          type
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error obteniendo última foto",
        };
      }
    },
    [userId, progressPhotoUseCase]
  );

  /**
   * Obtener estadísticas de progreso
   */
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const result = await progressPhotoUseCase.obtenerEstadisticasProgreso(
        userId
      );

      if (result.success) {
        setStats(result.data || null);
      } else {
        setStatsError(result.error || "Error obteniendo estadísticas");
      }
    } catch (error) {
      setStatsError(
        error instanceof Error ? error.message : "Error inesperado"
      );
    } finally {
      setIsLoadingStats(false);
    }
  }, [userId, progressPhotoUseCase]);

  /**
   * Obtener timeline de progreso
   */
  const fetchTimeline = useCallback(
    async (limit?: number) => {
      if (!userId) return;

      setIsLoadingTimeline(true);
      setError(null);

      try {
        const result = await progressPhotoUseCase.obtenerTimelineProgreso(
          userId,
          limit
        );

        if (result.success) {
          setTimeline(result.data || []);
        } else {
          setError(result.error || "Error obteniendo timeline");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setIsLoadingTimeline(false);
      }
    },
    [userId, progressPhotoUseCase]
  );

  /**
   * Eliminar foto de progreso
   */
  const deletePhoto = useCallback(
    async (photoId: number) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsDeleting(true);

      try {
        const result = await progressPhotoUseCase.eliminarFoto(userId, photoId);

        if (result.success) {
          // Refrescar las fotos después de eliminar
          await fetchPhotos();

          // Refrescar estadísticas
          fetchStats();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Error eliminando foto",
        };
      } finally {
        setIsDeleting(false);
      }
    },
    [userId, progressPhotoUseCase, fetchPhotos]
  );

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(() => {
    fetchPhotos();
    fetchStats();
    fetchTimeline();
  }, [fetchPhotos, fetchStats, fetchTimeline]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    setError(null);
    setUploadError(null);
    setStatsError(null);
  }, []);

  // Estados computados
  const hasPhotos = photos.length > 0;
  const totalPhotos = photos.length;
  const isLoadingAny = isLoading || isLoadingStats || isLoadingTimeline;
  const hasErrors =
    error !== null || uploadError !== null || statsError !== null;

  // Fotos por tipo (acceso fácil)
  const frontPhotos = photosByType.front;
  const sidePhotos = photosByType.side;
  const backPhotos = photosByType.back;
  const customPhotos = photosByType.custom;

  return {
    // Datos
    photos,
    photosByType,
    frontPhotos,
    sidePhotos,
    backPhotos,
    customPhotos,
    stats,
    timeline,

    // Estados
    isLoading,
    isLoadingStats,
    isLoadingTimeline,
    isUploading,
    isDeleting,
    isUpdating,
    isLoadingAny,
    hasPhotos,
    totalPhotos,
    hasErrors,

    // Errores
    error,
    uploadError,
    statsError,

    // Acciones
    fetchPhotos,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    getLatestPhoto,
    fetchStats,
    fetchTimeline,
    refreshAll,
    clearErrors,
  };
};

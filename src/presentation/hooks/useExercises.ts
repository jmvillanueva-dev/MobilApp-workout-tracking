import { useEffect, useState } from "react";
import { Exercise } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Hook para gestionar ejercicios
 */
export function useExercises() {
  const { exerciseUseCase } = useDependencies();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar todos los ejercicios
   */
  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando ejercicios...");

      const result = await exerciseUseCase.obtenerTodos();

      if (result.success && result.data) {
        setExercises(result.data);
        console.log(`✅ ${result.data.length} ejercicios cargados`);
      } else {
        setError(result.error || "Error al cargar ejercicios");
        console.error("❌ Error cargando ejercicios:", result.error);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("❌ Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo ejercicio
   */
  const createExercise = async (exerciseData: {
    name: string;
    description?: string;
    videoUrl?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📝 Creando ejercicio:", exerciseData.name);

      const result = await exerciseUseCase.crear(exerciseData);

      if (result.success && result.data) {
        setExercises((prev) => [...prev, result.data!]);
        console.log("✅ Ejercicio creado exitosamente");
        return { success: true, data: result.data };
      } else {
        setError(result.error || "Error al crear ejercicio");
        console.error("❌ Error creando ejercicio:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message;
      setError(errorMessage);
      console.error("❌ Error inesperado:", error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear ejercicio con video
   */
  const createExerciseWithVideo = async (
    exerciseData: { name: string; description?: string },
    videoUri?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📝 Creando ejercicio con video:", exerciseData.name);

      const result = await exerciseUseCase.crearConVideo(
        exerciseData,
        videoUri
      );

      if (result.success && result.data) {
        setExercises((prev) => [...prev, result.data!]);
        console.log("✅ Ejercicio con video creado exitosamente");
        return { success: true, data: result.data };
      } else {
        setError(result.error || "Error al crear ejercicio con video");
        console.error("❌ Error creando ejercicio con video:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message;
      setError(errorMessage);
      console.error("❌ Error inesperado:", error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar ejercicios
   */
  const searchExercises = async (query: string) => {
    if (!query || query.trim().length < 2) {
      loadExercises();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await exerciseUseCase.buscar(query);

      if (result.success && result.data) {
        setExercises(result.data);
      } else {
        setError(result.error || "Error en la búsqueda");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar ejercicio
   */
  const deleteExercise = async (exerciseId: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await exerciseUseCase.eliminar(exerciseId);

      if (result.success) {
        setExercises((prev) =>
          prev.filter((exercise) => exercise.id !== exerciseId)
        );
        console.log("✅ Ejercicio eliminado exitosamente");
        return { success: true };
      } else {
        setError(result.error || "Error al eliminar ejercicio");
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cargar ejercicios al montar el componente
  useEffect(() => {
    loadExercises();
  }, [exerciseUseCase]);

  return {
    exercises,
    loading,
    error,
    loadExercises,
    fetchExercises: loadExercises,
    createExercise,
    createExerciseWithVideo,
    searchExercises,
    deleteExercise,
    refreshExercises: loadExercises,
  };
}

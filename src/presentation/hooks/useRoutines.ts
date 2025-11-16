import { useEffect, useState } from "react";
import { Routine } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Hook para gestionar rutinas
 */
export function useRoutines() {
  const { routineUseCase } = useDependencies();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar todas las rutinas
   */
  const loadRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando rutinas...");

      const result = await routineUseCase.obtenerTodas();

      if (result.success && result.data) {
        setRoutines(result.data);
        console.log(`✅ ${result.data.length} rutinas cargadas`);
      } else {
        setError(result.error || "Error al cargar rutinas");
        console.error("❌ Error cargando rutinas:", result.error);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("❌ Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar rutinas
   */
  const searchRoutines = async (query: string) => {
    if (!query || query.trim().length < 2) {
      loadRoutines();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await routineUseCase.buscar(query);

      if (result.success && result.data) {
        setRoutines(result.data);
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
   * Crear nueva rutina
   */
  const createRoutine = async (routineData: {
    name: string;
    description?: string;
    daysOfWeek: string[];
    exercises: {
      exerciseId: number;
      sets: number;
      reps: number;
      restTime?: number;
      weight?: number;
      notes?: string;
      order: number;
    }[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📝 Creando rutina:", routineData.name);

      // Transformar datos al formato esperado por el use case
      const createRequest = {
        name: routineData.name,
        description: routineData.description,
        daysOfWeek: routineData.daysOfWeek,
        exercises: routineData.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps.toString(),
          restSeconds: ex.restTime || 60,
          order: ex.order,
        })),
      };

      const result = await routineUseCase.crear(createRequest);

      if (result.success && result.data) {
        setRoutines((prev) => [...prev, result.data!]);
        console.log("✅ Rutina creada exitosamente");
        return { success: true, data: result.data };
      } else {
        setError(result.error || "Error al crear rutina");
        console.error("❌ Error creando rutina:", result.error);
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
   * Eliminar rutina
   */
  const deleteRoutine = async (routineId: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await routineUseCase.eliminar(routineId);

      if (result.success) {
        setRoutines((prev) =>
          prev.filter((routine) => routine.id !== routineId)
        );
        console.log("✅ Rutina eliminada exitosamente");
        return { success: true };
      } else {
        setError(result.error || "Error al eliminar rutina");
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

  // Cargar rutinas al montar el componente
  useEffect(() => {
    loadRoutines();
  }, [routineUseCase]);

  return {
    routines,
    loading,
    error,
    loadRoutines,
    createRoutine,
    searchRoutines,
    deleteRoutine,
    refreshRoutines: loadRoutines,
  };
}

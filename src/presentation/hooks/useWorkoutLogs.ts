import { useCallback, useEffect, useState } from "react";
import { WorkoutLog } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Estado para estadísticas de workout logs
 */
interface WorkoutStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
  currentStreak: number;
  lastWorkoutDate?: Date;
}

/**
 * Estado para datos de actividad mensual
 */
interface ActivityData {
  date: string;
  workouts: number;
  routinesCompleted: string[];
}

/**
 * Hook para manejar los logs de entrenamientos
 */
export const useWorkoutLogs = (userId?: string) => {
  const { workoutLogUseCase } = useDependencies();

  // Estados
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<ActivityData[]>([]);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados de error
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  /**
   * Obtener logs de entrenamiento del usuario
   */
  const fetchWorkoutLogs = useCallback(
    async (limit?: number) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await workoutLogUseCase.obtenerEntrenamientos(
          userId,
          limit
        );

        if (result.success) {
          setWorkoutLogs(result.data || []);
        } else {
          setError(result.error || "Error obteniendo entrenamientos");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Crear nuevo log de entrenamiento
   */
  const createWorkoutLog = useCallback(
    async (routineId: number, notes?: string) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsCreating(true);

      try {
        const result = await workoutLogUseCase.crearWorkoutLog({
          userId,
          routineId,
          completedAt: new Date(),
          notes,
        });

        if (result.success && result.data) {
          // Agregar el nuevo log al inicio de la lista
          setWorkoutLogs((prev) => [result.data!, ...prev]);

          // Refrescar estadísticas
          fetchStats();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error inesperado",
        };
      } finally {
        setIsCreating(false);
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Marcar rutina como completada (método rápido)
   */
  const markRoutineCompleted = useCallback(
    async (routineId: number, durationMinutes?: number, notes?: string) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsCreating(true);

      try {
        const result = await workoutLogUseCase.marcarRutinaCompletada(
          userId,
          routineId,
          durationMinutes,
          notes
        );

        if (result.success && result.data) {
          // Agregar el nuevo log al inicio de la lista
          setWorkoutLogs((prev) => [result.data!, ...prev]);

          // Refrescar estadísticas
          fetchStats();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error inesperado",
        };
      } finally {
        setIsCreating(false);
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Verificar si completó rutina hoy
   */
  const checkCompletedToday = useCallback(
    async (routineId: number) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      try {
        const result = await workoutLogUseCase.verificarCompletadoHoy(
          userId,
          routineId
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error verificando completado hoy",
        };
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Obtener estadísticas de entrenamientos
   */
  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const result = await workoutLogUseCase.obtenerEstadisticas(userId);

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
  }, [userId, workoutLogUseCase]);

  /**
   * Obtener actividad mensual para calendario
   */
  const fetchMonthlyActivity = useCallback(
    async (year: number, month: number) => {
      if (!userId) return;

      setIsLoadingActivity(true);
      setActivityError(null);

      try {
        const result = await workoutLogUseCase.obtenerActividadMensual(
          userId,
          year,
          month
        );

        if (result.success) {
          setMonthlyActivity(result.data || []);
        } else {
          setActivityError(
            result.error || "Error obteniendo actividad mensual"
          );
        }
      } catch (error) {
        setActivityError(
          error instanceof Error ? error.message : "Error inesperado"
        );
      } finally {
        setIsLoadingActivity(false);
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Actualizar log existente
   */
  const updateWorkoutLog = useCallback(
    async (id: number, notes?: string) => {
      try {
        const result = await workoutLogUseCase.actualizarWorkoutLog({
          id,
          notes,
        });

        if (result.success && result.data) {
          // Actualizar el log en la lista
          setWorkoutLogs((prev) =>
            prev.map((log) => (log.id === id ? result.data! : log))
          );
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error actualizando entrenamiento",
        };
      }
    },
    [workoutLogUseCase]
  );

  /**
   * Eliminar log de entrenamiento
   */
  const deleteWorkoutLog = useCallback(
    async (logId: number) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsDeleting(true);

      try {
        const result = await workoutLogUseCase.eliminarWorkoutLog(
          userId,
          logId
        );

        if (result.success) {
          // Remover el log de la lista
          setWorkoutLogs((prev) => prev.filter((log) => log.id !== logId));

          // Refrescar estadísticas
          fetchStats();
        }

        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error eliminando entrenamiento",
        };
      } finally {
        setIsDeleting(false);
      }
    },
    [userId, workoutLogUseCase]
  );

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(() => {
    fetchWorkoutLogs();
    fetchStats();

    // Refrescar actividad del mes actual
    const now = new Date();
    fetchMonthlyActivity(now.getFullYear(), now.getMonth() + 1);
  }, [fetchWorkoutLogs, fetchStats, fetchMonthlyActivity]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    setError(null);
    setStatsError(null);
    setActivityError(null);
  }, []);

  // Efectos
  useEffect(() => {
    if (userId) {
      fetchWorkoutLogs();
      fetchStats();
    }
  }, [userId, fetchWorkoutLogs, fetchStats]);

  // Estados computados
  const hasLogs = workoutLogs.length > 0;
  const isLoadingAny = isLoading || isLoadingStats || isLoadingActivity;
  const hasErrors =
    error !== null || statsError !== null || activityError !== null;

  return {
    // Datos
    workoutLogs,
    stats,
    monthlyActivity,

    // Estados
    isLoading,
    isLoadingStats,
    isLoadingActivity,
    isCreating,
    isDeleting,
    isLoadingAny,
    hasLogs,
    hasErrors,

    // Errores
    error,
    statsError,
    activityError,

    // Acciones
    fetchWorkoutLogs,
    createWorkoutLog,
    markRoutineCompleted,
    checkCompletedToday,
    updateWorkoutLog,
    deleteWorkoutLog,
    fetchStats,
    fetchMonthlyActivity,
    refreshAll,
    clearErrors,
  };
};

import { useCallback, useState } from "react";
import { SimpleWorkoutLogRepository } from "../../data/repositories/SimpleWorkoutLogRepository";

const workoutLogRepo = new SimpleWorkoutLogRepository();

export const useSimpleWorkoutLogs = (userId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkoutLog = useCallback(
    async (routineId: number, notes?: string) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      setIsCreating(true);
      setError(null);

      try {
        // Verificar si ya completó esta rutina hoy
        const completedToday = await workoutLogRepo.verificarCompletadoHoy(
          userId,
          routineId
        );

        if (!completedToday.success) {
          return { success: false, error: completedToday.error };
        }

        if (completedToday.data) {
          return {
            success: false,
            error: "Ya has completado esta rutina hoy",
          };
        }

        // Crear el log
        const result = await workoutLogRepo.crear(userId, routineId, notes);

        if (!result.success) {
          setError(result.error || "Error al crear workout log");
          return { success: false, error: result.error };
        }

        return { success: true, data: result.data };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error inesperado";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [userId]
  );

  const getWorkoutLogs = useCallback(
    async (limit?: number) => {
      if (!userId) return { success: false, error: "ID de usuario requerido" };

      try {
        const result = await workoutLogRepo.obtenerPorUsuario(userId, limit);

        if (!result.success) {
          setError(result.error || "Error al obtener workout logs");
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error inesperado";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [userId]
  );

  return {
    createWorkoutLog,
    getWorkoutLogs,
    isCreating,
    error,
  };
};

import {
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  WorkoutLog,
} from "../models";
import { IWorkoutLogRepository } from "../repositories";
import { IWorkoutLogUseCase } from "./IWorkoutLogUseCase";

/**
 * WorkoutStats - Estadísticas de entrenamientos
 */
export interface WorkoutStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
  currentStreak: number;
  lastWorkoutDate?: Date;
}

/**
 * ActivityData - Datos de actividad para calendario/gráficos
 */
export interface ActivityData {
  date: string; // YYYY-MM-DD
  workouts: number;
  routinesCompleted: string[];
}

/**
 * WorkoutLogUseCase - Implementación concreta para casos de uso de logs de entrenamiento
 *
 * Maneja la lógica de negocio para el registro y seguimiento de entrenamientos.
 */
export class WorkoutLogUseCase implements IWorkoutLogUseCase {
  constructor(private workoutLogRepository: IWorkoutLogRepository) {}

  /**
   * Crear un nuevo log de entrenamiento
   */
  async crearWorkoutLog(
    request: CreateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      // Validaciones de negocio
      if (!request.userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!request.routineId) {
        return { success: false, error: "ID de rutina requerido" };
      }

      // Verificar si ya completó esta rutina hoy
      const completedToday =
        await this.workoutLogRepository.verificarCompletadoHoy(
          request.userId,
          request.routineId
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
      const result = await this.workoutLogRepository.crear(request);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en crearWorkoutLog:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualizar un log existente
   */
  async actualizarWorkoutLog(
    request: UpdateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      if (!request.id) {
        return { success: false, error: "ID de log requerido" };
      }

      const result = await this.workoutLogRepository.actualizar(
        request.id,
        request
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en actualizarWorkoutLog:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Marcar rutina del día como completada (método rápido)
   */
  async marcarRutinaCompletada(
    userId: string,
    routineId: number,
    durationMinutes?: number,
    notes?: string
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!routineId) {
        return { success: false, error: "ID de rutina requerido" };
      }

      // Crear el request
      const request: CreateWorkoutLogRequest = {
        userId,
        routineId,
        completedAt: new Date(),
        notes:
          notes ||
          `Rutina completada${
            durationMinutes ? ` en ${durationMinutes} minutos` : ""
          }`,
      };

      return await this.crearWorkoutLog(request);
    } catch (error) {
      console.error("Error en marcarRutinaCompletada:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener entrenamientos del usuario
   */
  async obtenerEntrenamientos(
    userId: string,
    limite?: number
  ): Promise<{ success: boolean; data?: WorkoutLog[]; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.workoutLogRepository.obtenerPorUsuario(
        userId,
        limite
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      console.error("Error en obtenerEntrenamientos:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Verificar si completó la rutina hoy
   */
  async verificarCompletadoHoy(
    userId: string,
    routineId: number
  ): Promise<{ success: boolean; data?: boolean; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!routineId) {
        return { success: false, error: "ID de rutina requerido" };
      }

      const result = await this.workoutLogRepository.verificarCompletadoHoy(
        userId,
        routineId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data || false,
      };
    } catch (error) {
      console.error("Error en verificarCompletadoHoy:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async obtenerEstadisticas(
    userId: string
  ): Promise<{ success: boolean; data?: WorkoutStats; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.workoutLogRepository.obtenerEstadisticas(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Asegurar que tenemos valores por defecto
      const stats: WorkoutStats = {
        totalWorkouts: result.data?.totalWorkouts || 0,
        thisWeekWorkouts: result.data?.workoutsThisWeek || 0,
        thisMonthWorkouts: result.data?.workoutsThisMonth || 0,
        currentStreak: result.data?.currentStreak || 0,
        lastWorkoutDate: result.data?.lastWorkoutDate,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error en obtenerEstadisticas:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener actividad mensual para calendario
   */
  async obtenerActividadMensual(
    userId: string,
    year: number,
    month: number
  ): Promise<{ success: boolean; data?: ActivityData[]; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (year < 2020 || year > 2030) {
        return { success: false, error: "Año inválido" };
      }

      if (month < 1 || month > 12) {
        return { success: false, error: "Mes inválido (1-12)" };
      }

      const result = await this.workoutLogRepository.obtenerActividadMensual(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Transformar los datos al formato esperado
      const activityData: ActivityData[] = (result.data || []).map((item) => ({
        date: item.date,
        workouts: item.workoutCount,
        routinesCompleted: item.routineNames,
      }));

      return {
        success: true,
        data: activityData,
      };
    } catch (error) {
      console.error("Error en obtenerActividadMensual:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Eliminar log de entrenamiento
   */
  async eliminarWorkoutLog(
    userId: string,
    logId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (!logId) {
        return { success: false, error: "ID de log requerido" };
      }

      const result = await this.workoutLogRepository.eliminar(logId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error en eliminarWorkoutLog:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

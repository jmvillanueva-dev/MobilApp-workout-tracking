import {
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  WorkoutLog,
} from "../models";

/**
 * IWorkoutLogRepository - Interface para el repositorio de registros de entrenamiento
 *
 * Define las operaciones CRUD para workout logs.
 */
export interface IWorkoutLogRepository {
  /**
   * Obtener todos los workout logs del usuario actual
   */
  obtenerPorUsuario(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{ success: boolean; data?: WorkoutLog[]; error?: string }>;

  /**
   * Obtener workout log específico por ID
   */
  obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Crear un nuevo registro de entrenamiento
   */
  crear(
    workoutLog: CreateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Actualizar un registro de entrenamiento existente
   */
  actualizar(
    id: number,
    workoutLog: UpdateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Eliminar un registro de entrenamiento
   */
  eliminar(id: number): Promise<{ success: boolean; error?: string }>;

  /**
   * Verificar si el usuario completó una rutina específica hoy
   */
  verificarCompletadoHoy(
    userId: string,
    routineId: number
  ): Promise<{ success: boolean; data?: boolean; error?: string }>;

  /**
   * Obtener estadísticas de progreso del usuario
   */
  obtenerEstadisticas(userId: string): Promise<{
    success: boolean;
    data?: {
      totalWorkouts: number;
      workoutsThisWeek: number;
      workoutsThisMonth: number;
      lastWorkoutDate?: Date;
      currentStreak: number;
    };
    error?: string;
  }>;

  /**
   * Obtener actividad del mes actual para calendario
   */
  obtenerActividadMensual(userId: string): Promise<{
    success: boolean;
    data?: {
      date: string;
      workoutCount: number;
      routineNames: string[];
    }[];
    error?: string;
  }>;
}

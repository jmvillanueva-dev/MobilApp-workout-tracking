import {
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  WorkoutLog,
} from "../models";

// Las interfaces CreateWorkoutLogRequest y UpdateWorkoutLogRequest
// se definen en ../models/Progress.ts para evitar duplicaciones

// WorkoutExerciseLog se define en ../models/WorkoutLog.ts

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
 * IWorkoutLogUseCase - Casos de uso para logs de entrenamiento
 *
 * Define la lógica de negocio para el registro y seguimiento de entrenamientos.
 */
export interface IWorkoutLogUseCase {
  /**
   * Crear un nuevo log de entrenamiento
   */
  crearWorkoutLog(
    request: CreateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Actualizar un log existente
   */
  actualizarWorkoutLog(
    request: UpdateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Marcar rutina del día como completada (método rápido)
   */
  marcarRutinaCompletada(
    userId: string,
    routineId: number,
    durationMinutes?: number,
    notes?: string
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }>;

  /**
   * Obtener entrenamientos del usuario
   */
  obtenerEntrenamientos(
    userId: string,
    limite?: number
  ): Promise<{ success: boolean; data?: WorkoutLog[]; error?: string }>;

  /**
   * Verificar si completó la rutina hoy
   */
  verificarCompletadoHoy(
    userId: string,
    routineId: number
  ): Promise<{ success: boolean; data?: boolean; error?: string }>;

  /**
   * Obtener estadísticas generales
   */
  obtenerEstadisticas(
    userId: string
  ): Promise<{ success: boolean; data?: WorkoutStats; error?: string }>;

  /**
   * Obtener actividad mensual para calendario
   */
  obtenerActividadMensual(
    userId: string,
    year: number,
    month: number
  ): Promise<{ success: boolean; data?: ActivityData[]; error?: string }>;

  /**
   * Eliminar log de entrenamiento
   */
  eliminarWorkoutLog(
    userId: string,
    logId: number
  ): Promise<{ success: boolean; error?: string }>;
}

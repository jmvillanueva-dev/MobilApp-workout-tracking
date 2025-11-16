import { DailyRoutine, WeeklyPlan } from "../models";

/**
 * IUserRoutineUseCase - Casos de uso para rutinas del usuario
 *
 * Define la lógica de negocio para que los usuarios gestionen sus rutinas asignadas.
 */
export interface IUserRoutineUseCase {
  /**
   * Obtener la rutina del día actual
   */
  obtenerRutinaDeHoy(
    userId: string
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }>;

  /**
   * Obtener rutina de un día específico de la semana
   */
  obtenerRutinaDeDia(
    userId: string,
    dayOfWeek: number
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }>;

  /**
   * Obtener el plan semanal completo
   */
  obtenerPlanSemanal(
    userId: string
  ): Promise<{ success: boolean; data?: WeeklyPlan; error?: string }>;

  /**
   * Verificar si tiene un plan activo
   */
  verificarPlanActivo(userId: string): Promise<{
    success: boolean;
    data?: {
      hasPlan: boolean;
      planId?: number;
      planName?: string;
      trainerName?: string;
      startDate?: Date;
      endDate?: Date;
      daysRemaining?: number;
      completionPercentage?: number;
    };
    error?: string;
  }>;

  /**
   * Obtener ejercicios detallados de una rutina
   */
  obtenerEjerciciosDetallados(routineId: number): Promise<{
    success: boolean;
    data?: {
      id: number;
      name: string;
      description?: string;
      videoUrl?: string;
      sets?: number;
      reps?: number;
      weight?: number;
      durationSeconds?: number;
      restSeconds?: number;
      orderInRoutine: number;
      muscleGroups?: string[];
      equipment?: string[];
      difficulty?: "beginner" | "intermediate" | "advanced";
    }[];
    error?: string;
  }>;

  /**
   * Obtener progreso semanal
   */
  obtenerProgresoSemanal(userId: string): Promise<{
    success: boolean;
    data?: {
      weekStart: Date;
      weekEnd: Date;
      totalRoutines: number;
      completedRoutines: number;
      completionPercentage: number;
      dailyProgress: {
        date: Date;
        dayName: string;
        hasRoutine: boolean;
        completed: boolean;
        routineName?: string;
        completedAt?: Date;
        durationMinutes?: number;
      }[];
    };
    error?: string;
  }>;

  /**
   * Obtener calendario de entrenamientos (mes completo)
   */
  obtenerCalendarioMensual(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    success: boolean;
    data?: {
      date: string; // YYYY-MM-DD
      hasRoutine: boolean;
      routineName?: string;
      completed: boolean;
      completedAt?: Date;
      durationMinutes?: number;
      dayOfWeek: number;
    }[];
    error?: string;
  }>;
}

import { DailyRoutine, WeeklyPlan } from "../models";

/**
 * IUserRoutineRepository - Interface para rutinas del usuario
 *
 * Define operaciones específicas para que los usuarios vean sus rutinas asignadas.
 */
export interface IUserRoutineRepository {
  /**
   * Obtener la rutina asignada para el día actual
   */
  obtenerRutinaDelDia(
    userId: string
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }>;

  /**
   * Obtener el plan semanal completo del usuario
   */
  obtenerPlanSemanal(
    userId: string
  ): Promise<{ success: boolean; data?: WeeklyPlan; error?: string }>;

  /**
   * Verificar si el usuario tiene un plan activo
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
    };
    error?: string;
  }>;

  /**
   * Obtener ejercicios de una rutina específica
   */
  obtenerEjerciciosDeRutina(routineId: number): Promise<{
    success: boolean;
    data?: {
      id: number;
      name: string;
      description?: string;
      videoUrl?: string;
      sets?: number;
      reps?: string; // TEXT en DB (ej: "8-10")
      restSeconds?: number;
      order: number; // "order" en routine_exercises
    }[];
    error?: string;
  }>;
}

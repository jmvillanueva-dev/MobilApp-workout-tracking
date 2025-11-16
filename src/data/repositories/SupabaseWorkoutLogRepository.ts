import {
  CreateWorkoutLogRequest,
  UpdateWorkoutLogRequest,
  WorkoutLog,
} from "../../domain/models";
import { IWorkoutLogRepository } from "../../domain/repositories";
import { supabase } from "../services/supabaseClient";

/**
 * SupabaseWorkoutLogRepository - Implementación concreta para logs de entrenamientos
 *
 * Maneja todas las operaciones relacionadas con el registro de entrenamientos completados.
 */
export class SupabaseWorkoutLogRepository implements IWorkoutLogRepository {
  /**
   * Obtener workout logs del usuario
   */
  async obtenerPorUsuario(
    userId: string,
    limite?: number
  ): Promise<{ success: boolean; data?: WorkoutLog[]; error?: string }> {
    try {
      let query = supabase
        .from("workout_logs")
        .select(
          `
          id,
          user_id,
          routine_id,
          completed_at,
          notes,
          routines:routine_id (
            id,
            name,
            description
          )
        `
        )
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (limite) {
        query = query.limit(limite);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error obteniendo workout logs:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: true, data: [] };
      }

      const workoutLogs = data.map((log: any) => ({
        id: log.id,
        userId: log.user_id,
        routineId: log.routine_id,
        completedAt: new Date(log.completed_at),
        notes: log.notes,
        createdAt: new Date(log.completed_at), // Usar completed_at como fallback
        updatedAt: new Date(log.completed_at), // Usar completed_at como fallback
        routine: log.routines
          ? {
              id: log.routines.id,
              name: log.routines.name,
              description: log.routines.description,
            }
          : undefined,
      }));

      return { success: true, data: workoutLogs };
    } catch (error) {
      console.error("Error inesperado obteniendo workout logs:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener workout log específico por ID
   */
  async obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .select(
          `
          id,
          user_id,
          routine_id,
          completed_at,
          notes,
          created_at,
          updated_at,
          routines:routine_id (
            id,
            name,
            description
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error obteniendo workout log por ID:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: true, data: undefined };
      }

      const workoutLog: WorkoutLog = {
        id: data.id,
        userId: data.user_id,
        routineId: data.routine_id,
        completedAt: new Date(data.completed_at),
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        routine: data.routines
          ? {
              id: data.routines.id,
              name: data.routines.name,
              description: data.routines.description,
            }
          : undefined,
      };

      return { success: true, data: workoutLog };
    } catch (error) {
      console.error("Error inesperado obteniendo workout log por ID:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Crear nuevo workout log
   */
  async crear(
    request: CreateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          user_id: request.userId,
          routine_id: request.routineId,
          completed_at: request.completedAt || new Date(),
          notes: request.notes,
        })
        .select(
          `
          id,
          user_id,
          routine_id,
          completed_at,
          notes,
          created_at,
          updated_at,
          routines:routine_id (
            id,
            name,
            description
          )
        `
        )
        .single();

      if (error) {
        console.error("Error creando workout log:", error);
        return { success: false, error: error.message };
      }

      const workoutLog: WorkoutLog = {
        id: data.id,
        userId: data.user_id,
        routineId: data.routine_id,
        completedAt: new Date(data.completed_at),
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        routine: data.routines
          ? {
              id: data.routines.id,
              name: data.routines.name,
              description: data.routines.description,
            }
          : undefined,
      };

      return { success: true, data: workoutLog };
    } catch (error) {
      console.error("Error inesperado creando workout log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualizar workout log existente
   */
  async actualizar(
    id: number,
    workoutLog: UpdateWorkoutLogRequest
  ): Promise<{ success: boolean; data?: WorkoutLog; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .update({
          notes: workoutLog.notes,
          updated_at: new Date(),
        })
        .eq("id", id)
        .select(
          `
          id,
          user_id,
          routine_id,
          completed_at,
          notes,
          created_at,
          updated_at,
          routines:routine_id (
            id,
            name,
            description
          )
        `
        )
        .single();

      if (error) {
        console.error("Error actualizando workout log:", error);
        return { success: false, error: error.message };
      }

      const workoutLog: WorkoutLog = {
        id: data.id,
        userId: data.user_id,
        routineId: data.routine_id,
        completedAt: new Date(data.completed_at),
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        routine: data.routines
          ? {
              id: data.routines.id,
              name: data.routines.name,
              description: data.routines.description,
            }
          : undefined,
      };

      return { success: true, data: workoutLog };
    } catch (error) {
      console.error("Error inesperado actualizando workout log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Verificar si completó rutina hoy
   */
  async verificarCompletadoHoy(
    userId: string,
    routineId: number
  ): Promise<{ success: boolean; data?: boolean; error?: string }> {
    try {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("routine_id", routineId)
        .gte("completed_at", todayStart.toISOString())
        .lt("completed_at", todayEnd.toISOString())
        .limit(1);

      if (error) {
        console.error("Error verificando completado hoy:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data && data.length > 0 };
    } catch (error) {
      console.error("Error inesperado verificando completado hoy:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener estadísticas básicas
   */
  async obtenerEstadisticas(userId: string): Promise<{
    success: boolean;
    data?: {
      totalWorkouts: number;
      thisWeekWorkouts: number;
      thisMonthWorkouts: number;
      currentStreak: number;
      lastWorkoutDate?: Date;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc(
        "obtener_estadisticas_usuario",
        {
          p_user_id: userId,
        }
      );

      if (error) {
        console.error("Error obteniendo estadísticas:", error);
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          data: {
            totalWorkouts: 0,
            thisWeekWorkouts: 0,
            thisMonthWorkouts: 0,
            currentStreak: 0,
          },
        };
      }

      const stats = data[0];
      return {
        success: true,
        data: {
          totalWorkouts: stats.total_workouts || 0,
          thisWeekWorkouts: stats.workouts_this_week || 0,
          thisMonthWorkouts: stats.workouts_this_month || 0,
          currentStreak: stats.current_streak || 0,
          lastWorkoutDate: stats.last_workout_date
            ? new Date(stats.last_workout_date)
            : undefined,
        },
      };
    } catch (error) {
      console.error("Error inesperado obteniendo estadísticas:", error);
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
  ): Promise<{
    success: boolean;
    data?: {
      date: string;
      workouts: number;
      routinesCompleted: string[];
    }[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc(
        "obtener_actividad_mensual_usuario",
        {
          p_user_id: userId,
          p_year: year,
          p_month: month,
        }
      );

      if (error) {
        console.error("Error obteniendo actividad mensual:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: true, data: [] };
      }

      const activityData = data.map((activity: any) => ({
        date: activity.activity_date,
        workouts: activity.workout_count || 0,
        routinesCompleted: activity.routine_names || [],
      }));

      return { success: true, data: activityData };
    } catch (error) {
      console.error("Error inesperado obteniendo actividad mensual:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Eliminar workout log
   */
  async eliminar(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error eliminando workout log:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Error inesperado eliminando workout log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

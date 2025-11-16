import { supabase } from "../services/supabaseClient";

export interface SimpleWorkoutLog {
  id: number;
  user_id: string;
  routine_id: number;
  completed_at: string;
  notes?: string;
}

/**
 * Repositorio simplificado para workout logs que usa solo el esquema real
 */
export class SimpleWorkoutLogRepository {
  /**
   * Crear nuevo workout log
   */
  async crear(
    userId: string,
    routineId: number,
    notes?: string
  ): Promise<{
    success: boolean;
    data?: SimpleWorkoutLog;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          user_id: userId,
          routine_id: routineId,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creando workout log:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error inesperado creando workout log:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener workout logs del usuario
   */
  async obtenerPorUsuario(
    userId: string,
    limite?: number
  ): Promise<{
    success: boolean;
    data?: SimpleWorkoutLog[];
    error?: string;
  }> {
    try {
      let query = supabase
        .from("workout_logs")
        .select("*")
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

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error inesperado obteniendo workout logs:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Verificar si ya completó una rutina hoy
   */
  async verificarCompletadoHoy(
    userId: string,
    routineId: number
  ): Promise<{
    success: boolean;
    data?: boolean;
    error?: string;
  }> {
    try {
      const hoy = new Date();
      const inicioHoy = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      );
      const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("workout_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("routine_id", routineId)
        .gte("completed_at", inicioHoy.toISOString())
        .lt("completed_at", finHoy.toISOString())
        .limit(1);

      if (error) {
        console.error("Error verificando completado hoy:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: (data?.length || 0) > 0 };
    } catch (error) {
      console.error("Error inesperado verificando completado hoy:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

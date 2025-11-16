import {
  DailyRoutine,
  IUserRoutineRepository,
  WeeklyPlan,
} from "../../domain/repositories";
import { supabase } from "../services/supabaseClient";

/**
 * SupabaseUserRoutineRepository - Implementación concreta para rutinas del usuario
 *
 * Maneja todas las operaciones relacionadas con rutinas asignadas a usuarios.
 */
export class SupabaseUserRoutineRepository implements IUserRoutineRepository {
  /**
   * Obtener la rutina asignada para el día actual
   */
  async obtenerRutinaDelDia(
    userId: string
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }> {
    try {
      const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const adjustedToday = today === 0 ? 7 : today; // Ajustar domingo: 0->7

      // Primero obtenemos el plan activo del usuario
      const { data: planData, error: planError } = await supabase
        .from("training_plans")
        .select(
          `
          id,
          name,
          trainer_id,
          profiles!training_plans_trainer_id_fkey (
            full_name
          )
        `
        )
        .eq("user_id", userId)
        .lte("start_date", new Date().toISOString().split("T")[0])
        .gte("end_date", new Date().toISOString().split("T")[0])
        .single();

      if (planError || !planData) {
        return {
          success: true,
          data: undefined,
        };
      }

      // Luego obtenemos la rutina para el día actual
      const { data: routineData, error: routineError } = await supabase
        .from("plan_routines")
        .select(
          `
          day_of_week,
          routines (
            id,
            name,
            description
          )
        `
        )
        .eq("plan_id", planData.id)
        .eq("day_of_week", adjustedToday)
        .single();

      if (routineError || !routineData || !routineData.routines) {
        return {
          success: true,
          data: undefined,
        };
      }

      const routine = Array.isArray(routineData.routines)
        ? routineData.routines[0]
        : routineData.routines;

      // Obtener ejercicios de la rutina
      const exercisesResult = await this.obtenerEjerciciosDeRutina(routine.id);
      const exercises = exercisesResult.success ? exercisesResult.data : [];

      // Verificar si ya fue completada hoy
      const { data: workoutLog } = await supabase
        .from("workout_logs")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("routine_id", routine.id)
        .gte("completed_at", new Date().toISOString().split("T")[0])
        .order("completed_at", { ascending: false })
        .limit(1);

      const completedToday = workoutLog && workoutLog.length > 0;

      return {
        success: true,
        data: {
          id: routine.id,
          name: routine.name,
          description: routine.description || undefined,
          dayOfWeek: routineData.day_of_week,
          planId: planData.id,
          planName: planData.name,
          completedToday: !!completedToday,
          completedAt: completedToday
            ? new Date(workoutLog[0].completed_at)
            : undefined,
          exercises: exercises || [],
        },
      };
    } catch (error) {
      console.error("Error inesperado obteniendo rutina del día:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener el plan semanal completo del usuario
   */
  async obtenerPlanSemanal(
    userId: string
  ): Promise<{ success: boolean; data?: WeeklyPlan; error?: string }> {
    try {
      // Obtener el plan activo
      const { data: planData, error: planError } = await supabase
        .from("training_plans")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          profiles!training_plans_trainer_id_fkey (
            full_name
          )
        `
        )
        .eq("user_id", userId)
        .lte("start_date", new Date().toISOString().split("T")[0])
        .gte("end_date", new Date().toISOString().split("T")[0])
        .single();

      if (planError || !planData) {
        return {
          success: true,
          data: undefined,
        };
      }

      // Obtener todas las rutinas del plan
      const { data: routinesData, error: routinesError } = await supabase
        .from("plan_routines")
        .select(
          `
          day_of_week,
          routines (
            id,
            name,
            description
          )
        `
        )
        .eq("plan_id", planData.id)
        .order("day_of_week");

      if (routinesError) {
        console.error("Error obteniendo rutinas del plan:", routinesError);
        return { success: false, error: routinesError.message };
      }

      // Crear array de rutinas para toda la semana (1-7, donde 1=Lunes)
      const weekDays = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ];

      const routinesByDay: { [key: number]: any } = {};
      routinesData?.forEach((item) => {
        routinesByDay[item.day_of_week] = item;
      });

      const routines = [];
      for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek++) {
        const dayRoutineData = routinesByDay[dayOfWeek];
        const routine = dayRoutineData
          ? Array.isArray(dayRoutineData.routines)
            ? dayRoutineData.routines[0]
            : dayRoutineData.routines
          : undefined;

        routines.push({
          dayOfWeek,
          dayName: weekDays[dayOfWeek - 1],
          routine: routine
            ? {
                id: routine.id,
                name: routine.name,
                description: routine.description,
                estimatedDurationMinutes: 45, // Valor por defecto
                difficultyLevel: "Intermedio", // Valor por defecto
                exerciseCount: 0, // Se podría calcular si es necesario
              }
            : undefined,
          completedThisWeek: false, // Se podría calcular consultando workout_logs
          lastCompletedAt: undefined,
        });
      }

      return {
        success: true,
        data: {
          planId: planData.id,
          planName: planData.name,
          trainerName: "Entrenador",
          startDate: new Date(planData.start_date),
          endDate: planData.end_date ? new Date(planData.end_date) : undefined,
          daysRemaining: planData.end_date
            ? Math.ceil(
                (new Date(planData.end_date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : undefined,
          routines,
        },
      };
    } catch (error) {
      console.error("Error inesperado obteniendo plan semanal:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Verificar si el usuario tiene un plan activo
   */
  async verificarPlanActivo(userId: string): Promise<{
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
  }> {
    try {
      const { data, error } = await supabase
        .from("training_plans")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          profiles!training_plans_trainer_id_fkey (
            full_name
          )
        `
        )
        .eq("user_id", userId)
        .lte("start_date", new Date().toISOString().split("T")[0])
        .gte("end_date", new Date().toISOString().split("T")[0])
        .single();

      if (error || !data) {
        return {
          success: true,
          data: {
            hasPlan: false,
          },
        };
      }

      return {
        success: true,
        data: {
          hasPlan: true,
          planId: data.id,
          planName: data.name,
          trainerName: "Entrenador", // Simplificado por ahora
          startDate: new Date(data.start_date),
          endDate: data.end_date ? new Date(data.end_date) : undefined,
        },
      };
    } catch (error) {
      console.error("Error inesperado verificando plan activo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener ejercicios de una rutina específica
   */
  async obtenerEjerciciosDeRutina(routineId: number): Promise<{
    success: boolean;
    data?: {
      id: number;
      name: string;
      description?: string;
      videoUrl?: string;
      sets?: number;
      reps?: string;
      restSeconds?: number;
      order: number;
    }[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("routine_exercises")
        .select(
          `
          sets,
          reps,
          rest_seconds,
          "order",
          exercises (
            id,
            name,
            description,
            video_url
          )
        `
        )
        .eq("routine_id", routineId)
        .order('"order"');

      if (error) {
        console.error("Error obteniendo ejercicios de rutina:", error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return {
          success: true,
          data: [],
        };
      }

      const exercises = data.map((item: any) => {
        const exercise = Array.isArray(item.exercises)
          ? item.exercises[0]
          : item.exercises;
        return {
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          videoUrl: exercise.video_url,
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.rest_seconds,
          order: item.order,
        };
      });

      return {
        success: true,
        data: exercises,
      };
    } catch (error) {
      console.error("Error inesperado obteniendo ejercicios de rutina:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

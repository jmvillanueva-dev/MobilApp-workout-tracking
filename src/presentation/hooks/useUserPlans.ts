import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../data/services/supabaseClient";

interface UserPlan {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  trainer_name: string;
  routines: {
    id: number;
    name: string;
    description?: string;
    day_of_week: number;
    exercises?: {
      id: number;
      name: string;
      description?: string;
      sets?: number;
      reps?: string;
      rest_seconds?: number;
      order: number;
    }[];
  }[];
}

export const useUserPlans = (userId?: string) => {
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPlans = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener planes del usuario con rutinas
      const { data: plansData, error: plansError } = await supabase
        .from("training_plans")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          trainer:trainer_id (
            full_name
          ),
          plan_routines (
            day_of_week,
            routine:routine_id (
              id,
              name,
              description
            )
          )
        `
        )
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (plansError) {
        throw new Error(plansError.message);
      }

      const formattedPlans: UserPlan[] = [];

      for (const plan of plansData || []) {
        // Para cada rutina del plan, obtener sus ejercicios
        const routinesWithExercises = [];

        for (const planRoutine of plan.plan_routines || []) {
          const routine = Array.isArray(planRoutine.routine)
            ? planRoutine.routine[0]
            : planRoutine.routine;

          // Obtener ejercicios de la rutina
          const { data: exercisesData } = await supabase
            .from("routine_exercises")
            .select(
              `
              sets,
              reps,
              rest_seconds,
              "order",
              exercise:exercise_id (
                id,
                name,
                description
              )
            `
            )
            .eq("routine_id", routine.id)
            .order('"order"');

          const exercises =
            exercisesData?.map((item) => {
              const exercise = Array.isArray(item.exercise)
                ? item.exercise[0]
                : item.exercise;
              return {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description,
                sets: item.sets,
                reps: item.reps,
                rest_seconds: item.rest_seconds,
                order: item.order,
              };
            }) || [];

          routinesWithExercises.push({
            id: routine.id,
            name: routine.name,
            description: routine.description,
            day_of_week: planRoutine.day_of_week,
            exercises,
          });
        }

        formattedPlans.push({
          id: plan.id,
          name: plan.name,
          start_date: plan.start_date,
          end_date: plan.end_date,
          trainer_name: "Entrenador",
          routines: routinesWithExercises,
        });
      }

      setPlans(formattedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  const logWorkout = useCallback(
    async (routineId: number, notes?: string) => {
      if (!userId) return { success: false, error: "Usuario requerido" };

      try {
        const { error } = await supabase.from("workout_logs").insert({
          user_id: userId,
          routine_id: routineId,
          notes: notes || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Error al registrar entrenamiento",
        };
      }
    },
    [userId, supabase]
  );

  const uploadProgressPhoto = useCallback(
    async (photoUri: string) => {
      if (!userId) return { success: false, error: "Usuario requerido" };

      try {
        // Por ahora solo guardamos la URI, después se puede implementar upload a Storage
        const { error } = await supabase.from("progress_photos").insert({
          user_id: userId,
          photo_url: photoUri,
        });

        if (error) {
          throw new Error(error.message);
        }

        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error al guardar foto",
        };
      }
    },
    [userId, supabase]
  );

  useEffect(() => {
    fetchUserPlans();
  }, [fetchUserPlans]);

  return {
    plans,
    loading,
    error,
    fetchUserPlans,
    logWorkout,
    uploadProgressPhoto,
  };
};

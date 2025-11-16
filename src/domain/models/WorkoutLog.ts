// WorkoutLog se define en Progress.ts para evitar duplicaciones

/**
 * WorkoutExerciseLog - Log básico de ejercicio completado
 * NOTA: Por ahora solo registramos que se completó la rutina
 * Los detalles por ejercicio se pueden agregar después
 */
export interface WorkoutExerciseLog {
  exerciseId: number;
  exerciseName: string;
  completed: boolean;
  notes?: string;
}

// ProgressPhoto se define en Progress.ts para evitar duplicaciones

/**
 * DailyRoutine - Rutina del día con información adicional
 */
export interface DailyRoutine {
  id: number;
  name: string;
  description?: string;

  // Información del contexto del día
  dayOfWeek: number;
  planId: number;
  planName: string;
  completedToday: boolean;
  completedAt?: Date;

  // Ejercicios de la rutina (datos reales de routine_exercises)
  exercises?: {
    id: number;
    name: string;
    description?: string;
    videoUrl?: string;
    sets?: number;
    reps?: string; // TEXT en la DB (ej: "8-10", "Al fallo")
    restSeconds?: number;
    order: number; // "order" en routine_exercises
  }[];
}

/**
 * WeeklyPlan - Plan semanal completo
 */
export interface WeeklyPlan {
  planId: number;
  planName: string;
  startDate: Date;
  endDate?: Date;

  routines: {
    dayOfWeek: number;
    dayName: string;
    routine?: {
      id: number;
      name: string;
      description?: string;
    };
    completedThisWeek: boolean;
  }[];
}

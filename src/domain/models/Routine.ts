/**
 * Routine - Modelo de dominio para rutinas de entrenamiento
 *
 * Una rutina es una colección organizada de ejercicios que puede ser
 * creada por entrenadores y asignada a usuarios.
 */
export interface Routine {
  id: number;
  name: string;
  description?: string;
  createdBy: string; // UUID del entrenador que la creó
  exercises: RoutineExercise[]; // Lista de ejercicios en la rutina
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * RoutineExercise - Ejercicio dentro de una rutina con sus parámetros específicos
 */
export interface RoutineExercise {
  id: number; // ID de routine_exercises
  exerciseId: number; // Referencia al Exercise
  exercise?: {
    id: number;
    name: string;
    description?: string;
    videoUrl?: string;
  };
  sets: number;
  reps: string; // "8-10", "Al fallo", etc.
  restSeconds: number;
  order: number; // Orden en la rutina
}

/**
 * CreateRoutineRequest - Datos necesarios para crear una nueva rutina
 */
export interface CreateRoutineRequest {
  name: string;
  description?: string;
  daysOfWeek: string[];
  exercises: CreateRoutineExerciseRequest[];
}

/**
 * CreateRoutineExerciseRequest - Ejercicio a agregar en una rutina nueva
 */
export interface CreateRoutineExerciseRequest {
  exerciseId: number;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
}

/**
 * UpdateRoutineRequest - Datos para actualizar una rutina existente
 */
export interface UpdateRoutineRequest {
  name?: string;
  description?: string;
  exercises?: UpdateRoutineExerciseRequest[];
}

/**
 * UpdateRoutineExerciseRequest - Actualización de ejercicio en rutina
 */
export interface UpdateRoutineExerciseRequest {
  id?: number; // Si existe, se actualiza; si no, se crea
  exerciseId: number;
  sets: number;
  reps: string;
  restSeconds: number;
  order: number;
}

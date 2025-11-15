/**
 * Exercise - Modelo de dominio para ejercicios
 *
 * Representa un ejercicio individual que puede ser creado por entrenadores
 * y utilizado en rutinas de entrenamiento.
 */
export interface Exercise {
  id: number;
  name: string;
  description?: string;
  videoUrl?: string;
  createdBy: string; // UUID del entrenador que lo creó
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * CreateExerciseRequest - Datos necesarios para crear un nuevo ejercicio
 */
export interface CreateExerciseRequest {
  name: string;
  description?: string;
  videoUrl?: string;
}

/**
 * UpdateExerciseRequest - Datos para actualizar un ejercicio existente
 */
export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  videoUrl?: string;
}

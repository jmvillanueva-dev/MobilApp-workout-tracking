/**
 * WorkoutLog - Modelo de dominio para registro de entrenamientos
 *
 * Representa el progreso registrado por un usuario al completar una rutina.
 */
export interface WorkoutLog {
  id: number;
  userId: string; // UUID del usuario
  routineId: number;
  completedAt: Date;
  notes?: string;

  // Información adicional para mostrar en UI
  routine?: {
    id: number;
    name: string;
    description?: string;
  };
  user?: {
    id: string;
    fullName: string;
  };
}

/**
 * CreateWorkoutLogRequest - Datos necesarios para registrar un entrenamiento
 */
export interface CreateWorkoutLogRequest {
  routineId: number;
  notes?: string;
}

/**
 * UpdateWorkoutLogRequest - Datos para actualizar un registro de entrenamiento
 */
export interface UpdateWorkoutLogRequest {
  notes?: string;
}

/**
 * ProgressPhoto - Modelo de dominio para fotos de progreso
 *
 * Fotos que los usuarios suben para documentar su progreso físico.
 */
export interface ProgressPhoto {
  id: number;
  userId: string; // UUID del usuario
  photoUrl: string; // Path en Supabase Storage
  createdAt: Date;

  // Información adicional del usuario
  user?: {
    id: string;
    fullName: string;
  };
}

/**
 * CreateProgressPhotoRequest - Datos para subir una nueva foto de progreso
 */
export interface CreateProgressPhotoRequest {
  photoUrl: string; // URL después de subir a Storage
}

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

// /**
//  * WorkoutLog - Registro de entrenamiento completado
//  */
// export interface WorkoutLog {
//   id: number;
//   userId: string;
//   routineId: number;
//   completedAt: Date;
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;

//   // Datos relacionales opcionales
//   routine?: {
//     id: number;
//     name: string;
//     description?: string;
//   };
// }

/**
 * CreateWorkoutLogRequest - Datos para crear un nuevo log de entrenamiento
 */
export interface CreateWorkoutLogRequest {
  userId: string;
  routineId: number;
  completedAt?: Date;
  notes?: string;
}

/**
 * UpdateWorkoutLogRequest - Datos para actualizar un registro de entrenamiento
 */
export interface UpdateWorkoutLogRequest {
  id: number;
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
  imageUrl: string; // URL de la imagen en Supabase Storage
  type: "front" | "side" | "back" | "custom";
  notes?: string;
  weight?: number;
  bodyFatPercentage?: number;
  takenAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Medidas corporales opcionales
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
    neck?: number;
  };
}

/**
 * CreateProgressPhotoRequest - Datos para crear una nueva foto de progreso
 */
export interface CreateProgressPhotoRequest {
  userId: string;
  imageUri: string; // URI local de la imagen
  type: "front" | "side" | "back" | "custom";
  notes?: string;
  weight?: number;
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
    neck?: number;
  };
}

/**
 * UpdateProgressPhotoRequest - Datos para actualizar foto existente
 */
export interface UpdateProgressPhotoRequest {
  id: number;
  notes?: string;
  weight?: number;
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep?: number;
    thigh?: number;
    neck?: number;
  };
}

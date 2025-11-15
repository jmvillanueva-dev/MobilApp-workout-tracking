/**
 * TrainingPlan - Modelo de dominio para planes de entrenamiento
 *
 * Un plan de entrenamiento asigna rutinas específicas a un usuario
 * en días determinados, creado y gestionado por un entrenador.
 */
export interface TrainingPlan {
  id: number;
  name: string;
  userId: string; // UUID del usuario asignado
  trainerId: string; // UUID del entrenador que lo creó
  startDate: Date;
  endDate?: Date;
  routines: PlanRoutine[]; // Rutinas programadas por días
  createdAt?: Date;
  updatedAt?: Date;

  // Información adicional del usuario y entrenador (para mostrar en UI)
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  trainer?: {
    id: string;
    fullName: string;
    email: string;
  };
}

/**
 * PlanRoutine - Rutina programada en un día específico del plan
 */
export interface PlanRoutine {
  id: number; // ID de plan_routines
  planId: number;
  routineId: number;
  dayOfWeek: number; // 1=Lunes, 2=Martes, ..., 7=Domingo
  routine?: {
    id: number;
    name: string;
    description?: string;
  };
}

/**
 * CreateTrainingPlanRequest - Datos necesarios para crear un plan de entrenamiento
 */
export interface CreateTrainingPlanRequest {
  name: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  routines: CreatePlanRoutineRequest[];
}

/**
 * CreatePlanRoutineRequest - Rutina a asignar en un plan nuevo
 */
export interface CreatePlanRoutineRequest {
  routineId: number;
  dayOfWeek: number;
}

/**
 * UpdateTrainingPlanRequest - Datos para actualizar un plan existente
 */
export interface UpdateTrainingPlanRequest {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  routines?: UpdatePlanRoutineRequest[];
}

/**
 * UpdatePlanRoutineRequest - Actualización de rutina en plan
 */
export interface UpdatePlanRoutineRequest {
  id?: number; // Si existe, se actualiza; si no, se crea
  routineId: number;
  dayOfWeek: number;
}

/**
 * DayOfWeek - Enum para los días de la semana
 */
export enum DayOfWeek {
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6,
  DOMINGO = 7,
}

/**
 * Función helper para obtener el nombre del día
 */
export function getDayName(dayOfWeek: number): string {
  const days = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
  };
  return days[dayOfWeek as keyof typeof days] || "Desconocido";
}

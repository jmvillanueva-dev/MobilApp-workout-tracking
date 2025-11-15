import {
  CreateTrainingPlanRequest,
  TrainingPlan,
  UpdateTrainingPlanRequest,
} from "../models";

/**
 * ITrainingPlanRepository - Interfaz del repositorio de planes de entrenamiento
 *
 * Define las operaciones para gestionar la asignación de planes de entrenamiento
 * entre entrenadores y usuarios.
 */
export interface ITrainingPlanRepository {
  /**
   * Obtener planes creados por un entrenador específico
   */
  obtenerPorEntrenador(
    trainerId: string
  ): Promise<{ success: boolean; data?: TrainingPlan[]; error?: string }>;

  /**
   * Obtener planes asignados a un usuario específico
   */
  obtenerPorUsuario(
    userId: string
  ): Promise<{ success: boolean; data?: TrainingPlan[]; error?: string }>;

  /**
   * Obtener un plan por su ID con rutinas
   */
  obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }>;

  /**
   * Crear un nuevo plan de entrenamiento
   */
  crear(
    plan: CreateTrainingPlanRequest
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }>;

  /**
   * Actualizar un plan de entrenamiento existente
   */
  actualizar(
    id: number,
    plan: UpdateTrainingPlanRequest
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }>;

  /**
   * Eliminar un plan de entrenamiento
   */
  eliminar(id: number): Promise<{ success: boolean; error?: string }>;

  /**
   * Obtener usuarios disponibles para asignar planes (para entrenadores)
   */
  obtenerUsuariosDisponibles(): Promise<{
    success: boolean;
    data?: { id: string; fullName: string; email: string }[];
    error?: string;
  }>;
}

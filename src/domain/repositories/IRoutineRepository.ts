import { CreateRoutineRequest, Routine, UpdateRoutineRequest } from "../models";

/**
 * IRoutineRepository - Interfaz del repositorio de rutinas
 *
 * Define las operaciones de persistencia para las rutinas de entrenamiento,
 * incluyendo la gestión de ejercicios asociados.
 */
export interface IRoutineRepository {
  /**
   * Obtener todas las rutinas disponibles
   */
  obtenerTodas(): Promise<{
    success: boolean;
    data?: Routine[];
    error?: string;
  }>;

  /**
   * Obtener rutinas creadas por un entrenador específico
   */
  obtenerPorEntrenador(
    trainerId: string
  ): Promise<{ success: boolean; data?: Routine[]; error?: string }>;

  /**
   * Obtener una rutina por su ID con sus ejercicios
   */
  obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: Routine; error?: string }>;

  /**
   * Crear una nueva rutina con ejercicios
   */
  crear(
    rutina: CreateRoutineRequest
  ): Promise<{ success: boolean; data?: Routine; error?: string }>;

  /**
   * Actualizar una rutina existente
   */
  actualizar(
    id: number,
    rutina: UpdateRoutineRequest
  ): Promise<{ success: boolean; data?: Routine; error?: string }>;

  /**
   * Eliminar una rutina
   */
  eliminar(id: number): Promise<{ success: boolean; error?: string }>;

  /**
   * Buscar rutinas por nombre
   */
  buscarPorNombre(
    query: string
  ): Promise<{ success: boolean; data?: Routine[]; error?: string }>;
}

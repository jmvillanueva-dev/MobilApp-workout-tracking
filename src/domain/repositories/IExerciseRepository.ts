import {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from "../models";

/**
 * IExerciseRepository - Interfaz del repositorio de ejercicios
 *
 * Define las operaciones de persistencia para los ejercicios,
 * siguiendo los principios de Clean Architecture.
 */
export interface IExerciseRepository {
  /**
   * Obtener todos los ejercicios disponibles
   */
  obtenerTodos(): Promise<{
    success: boolean;
    data?: Exercise[];
    error?: string;
  }>;

  /**
   * Obtener ejercicios creados por un entrenador específico
   */
  obtenerPorEntrenador(
    trainerId: string
  ): Promise<{ success: boolean; data?: Exercise[]; error?: string }>;

  /**
   * Obtener un ejercicio por su ID
   */
  obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: Exercise; error?: string }>;

  /**
   * Crear un nuevo ejercicio
   */
  crear(
    ejercicio: CreateExerciseRequest
  ): Promise<{ success: boolean; data?: Exercise; error?: string }>;

  /**
   * Actualizar un ejercicio existente
   */
  actualizar(
    id: number,
    ejercicio: UpdateExerciseRequest
  ): Promise<{ success: boolean; data?: Exercise; error?: string }>;

  /**
   * Eliminar un ejercicio
   */
  eliminar(id: number): Promise<{ success: boolean; error?: string }>;

  /**
   * Buscar ejercicios por nombre
   */
  buscarPorNombre(
    query: string
  ): Promise<{ success: boolean; data?: Exercise[]; error?: string }>;
}

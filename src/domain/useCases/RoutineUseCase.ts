import { CreateRoutineRequest, UpdateRoutineRequest } from "../models";
import { IRoutineRepository } from "../repositories/IRoutineRepository";

/**
 * RoutineUseCase - Caso de uso para gestión de rutinas de entrenamiento
 *
 * Contiene toda la lógica de negocio relacionada con rutinas.
 */
export class RoutineUseCase {
  constructor(private routineRepository: IRoutineRepository) {}

  /**
   * Obtener todas las rutinas disponibles
   */
  async obtenerTodas() {
    try {
      console.log("🏋️ RoutineUseCase - Obteniendo todas las rutinas");
      return await this.routineRepository.obtenerTodas();
    } catch (error: any) {
      console.error("❌ Error en obtenerTodas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener rutinas creadas por el entrenador actual
   */
  async obtenerMisRutinas() {
    try {
      console.log("🏋️ RoutineUseCase - Obteniendo mis rutinas");
      // Por ahora retornamos todas, pero podríamos filtrar por entrenador
      return await this.routineRepository.obtenerTodas();
    } catch (error: any) {
      console.error("❌ Error en obtenerMisRutinas:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener una rutina específica por ID
   */
  async obtenerPorId(id: number) {
    try {
      console.log("🏋️ RoutineUseCase - Obteniendo rutina:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de rutina inválido" };
      }

      return await this.routineRepository.obtenerPorId(id);
    } catch (error: any) {
      console.error("❌ Error en obtenerPorId:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear una nueva rutina
   */
  async crear(rutina: CreateRoutineRequest) {
    try {
      console.log("🏋️ RoutineUseCase - Creando rutina:", rutina.name);

      // Validaciones de negocio
      if (!rutina.name || rutina.name.trim().length < 2) {
        return {
          success: false,
          error: "El nombre de la rutina debe tener al menos 2 caracteres",
        };
      }

      if (rutina.name.trim().length > 100) {
        return {
          success: false,
          error: "El nombre de la rutina no puede exceder 100 caracteres",
        };
      }

      if (rutina.description && rutina.description.length > 500) {
        return {
          success: false,
          error: "La descripción no puede exceder 500 caracteres",
        };
      }

      if (!rutina.exercises || rutina.exercises.length === 0) {
        return {
          success: false,
          error: "La rutina debe tener al menos un ejercicio",
        };
      }

      if (rutina.exercises.length > 20) {
        return {
          success: false,
          error: "La rutina no puede tener más de 20 ejercicios",
        };
      }

      // Validar ejercicios
      for (const exercise of rutina.exercises) {
        if (!exercise.exerciseId || exercise.exerciseId <= 0) {
          return { success: false, error: "ID de ejercicio inválido" };
        }

        if (!exercise.sets || exercise.sets < 1 || exercise.sets > 10) {
          return {
            success: false,
            error: "Las series deben estar entre 1 y 10",
          };
        }

        if (!exercise.reps || exercise.reps.trim().length === 0) {
          return { success: false, error: "Las repeticiones son obligatorias" };
        }

        if (exercise.restSeconds < 0 || exercise.restSeconds > 600) {
          return {
            success: false,
            error: "El descanso debe estar entre 0 y 600 segundos",
          };
        }

        if (exercise.order < 1) {
          return {
            success: false,
            error: "El orden del ejercicio debe ser mayor a 0",
          };
        }
      }

      // Verificar que no haya órdenes duplicados
      const orders = rutina.exercises.map((e) => e.order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        return {
          success: false,
          error: "No puede haber ejercicios con el mismo orden",
        };
      }

      // Crear la rutina
      const rutinaData: CreateRoutineRequest = {
        name: rutina.name.trim(),
        description: rutina.description?.trim(),
        exercises: rutina.exercises.map((exercise) => ({
          ...exercise,
          reps: exercise.reps.trim(),
        })),
      };

      return await this.routineRepository.crear(rutinaData);
    } catch (error: any) {
      console.error("❌ Error en crear rutina:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar una rutina existente
   */
  async actualizar(id: number, rutina: UpdateRoutineRequest) {
    try {
      console.log("🏋️ RoutineUseCase - Actualizando rutina:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de rutina inválido" };
      }

      // Validaciones similares a crear
      if (rutina.name !== undefined) {
        if (!rutina.name || rutina.name.trim().length < 2) {
          return {
            success: false,
            error: "El nombre de la rutina debe tener al menos 2 caracteres",
          };
        }
        if (rutina.name.trim().length > 100) {
          return {
            success: false,
            error: "El nombre de la rutina no puede exceder 100 caracteres",
          };
        }
      }

      if (
        rutina.description !== undefined &&
        rutina.description &&
        rutina.description.length > 500
      ) {
        return {
          success: false,
          error: "La descripción no puede exceder 500 caracteres",
        };
      }

      if (rutina.exercises !== undefined) {
        if (rutina.exercises.length === 0) {
          return {
            success: false,
            error: "La rutina debe tener al menos un ejercicio",
          };
        }

        if (rutina.exercises.length > 20) {
          return {
            success: false,
            error: "La rutina no puede tener más de 20 ejercicios",
          };
        }

        // Validar cada ejercicio
        for (const exercise of rutina.exercises) {
          if (!exercise.exerciseId || exercise.exerciseId <= 0) {
            return { success: false, error: "ID de ejercicio inválido" };
          }

          if (!exercise.sets || exercise.sets < 1 || exercise.sets > 10) {
            return {
              success: false,
              error: "Las series deben estar entre 1 y 10",
            };
          }

          if (!exercise.reps || exercise.reps.trim().length === 0) {
            return {
              success: false,
              error: "Las repeticiones son obligatorias",
            };
          }

          if (exercise.restSeconds < 0 || exercise.restSeconds > 600) {
            return {
              success: false,
              error: "El descanso debe estar entre 0 y 600 segundos",
            };
          }

          if (exercise.order < 1) {
            return {
              success: false,
              error: "El orden del ejercicio debe ser mayor a 0",
            };
          }
        }

        // Verificar órdenes únicos
        const orders = rutina.exercises.map((e) => e.order);
        const uniqueOrders = new Set(orders);
        if (orders.length !== uniqueOrders.size) {
          return {
            success: false,
            error: "No puede haber ejercicios con el mismo orden",
          };
        }
      }

      const rutinaData: UpdateRoutineRequest = {
        name: rutina.name?.trim(),
        description: rutina.description?.trim(),
        exercises: rutina.exercises?.map((exercise) => ({
          ...exercise,
          reps: exercise.reps.trim(),
        })),
      };

      return await this.routineRepository.actualizar(id, rutinaData);
    } catch (error: any) {
      console.error("❌ Error en actualizar rutina:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar una rutina
   */
  async eliminar(id: number) {
    try {
      console.log("🏋️ RoutineUseCase - Eliminando rutina:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de rutina inválido" };
      }

      return await this.routineRepository.eliminar(id);
    } catch (error: any) {
      console.error("❌ Error en eliminar rutina:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar rutinas por nombre
   */
  async buscar(query: string) {
    try {
      console.log("🏋️ RoutineUseCase - Buscando rutinas:", query);

      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: "La búsqueda debe tener al menos 2 caracteres",
        };
      }

      return await this.routineRepository.buscarPorNombre(query.trim());
    } catch (error: any) {
      console.error("❌ Error en buscar rutinas:", error);
      return { success: false, error: error.message };
    }
  }
}

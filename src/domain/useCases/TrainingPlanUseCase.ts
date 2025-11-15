import {
  CreateTrainingPlanRequest,
  UpdateTrainingPlanRequest,
} from "../models";
import { ITrainingPlanRepository } from "../repositories/ITrainingPlanRepository";

/**
 * TrainingPlanUseCase - Caso de uso para gestión de planes de entrenamiento
 *
 * Contiene toda la lógica de negocio relacionada con planes de entrenamiento.
 */
export class TrainingPlanUseCase {
  constructor(private trainingPlanRepository: ITrainingPlanRepository) {}

  /**
   * Obtener planes creados por el entrenador actual
   */
  async obtenerMisPlanes() {
    try {
      console.log("🏃 TrainingPlanUseCase - Obteniendo mis planes");
      // Por ahora retornamos todos, pero deberíamos filtrar por entrenador
      // En el repositorio se manejará el filtro por el usuario actual
      return { success: true, data: [] }; // Placeholder por ahora
    } catch (error: any) {
      console.error("❌ Error en obtenerMisPlanes:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener planes asignados a un usuario específico
   */
  async obtenerPlanesPorUsuario(userId: string) {
    try {
      console.log(
        "🏃 TrainingPlanUseCase - Obteniendo planes del usuario:",
        userId
      );

      if (!userId || userId.trim().length === 0) {
        return { success: false, error: "ID de usuario inválido" };
      }

      return await this.trainingPlanRepository.obtenerPorUsuario(userId);
    } catch (error: any) {
      console.error("❌ Error en obtenerPlanesPorUsuario:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener un plan específico por ID
   */
  async obtenerPorId(id: number) {
    try {
      console.log("🏃 TrainingPlanUseCase - Obteniendo plan:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de plan inválido" };
      }

      return await this.trainingPlanRepository.obtenerPorId(id);
    } catch (error: any) {
      console.error("❌ Error en obtenerPorId:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear un nuevo plan de entrenamiento
   */
  async crear(plan: CreateTrainingPlanRequest) {
    try {
      console.log("🏃 TrainingPlanUseCase - Creando plan:", plan.name);

      // Validaciones de negocio
      if (!plan.name || plan.name.trim().length < 2) {
        return {
          success: false,
          error: "El nombre del plan debe tener al menos 2 caracteres",
        };
      }

      if (plan.name.trim().length > 100) {
        return {
          success: false,
          error: "El nombre del plan no puede exceder 100 caracteres",
        };
      }

      if (!plan.userId || plan.userId.trim().length === 0) {
        return { success: false, error: "Debe seleccionar un usuario" };
      }

      if (!plan.startDate) {
        return { success: false, error: "La fecha de inicio es obligatoria" };
      }

      // Validar que la fecha de inicio no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(plan.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return {
          success: false,
          error: "La fecha de inicio no puede ser anterior a hoy",
        };
      }

      // Validar fecha de fin si se proporciona
      if (plan.endDate) {
        const endDate = new Date(plan.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (endDate <= startDate) {
          return {
            success: false,
            error: "La fecha de fin debe ser posterior a la fecha de inicio",
          };
        }
      }

      if (!plan.routines || plan.routines.length === 0) {
        return {
          success: false,
          error: "El plan debe tener al menos una rutina asignada",
        };
      }

      if (plan.routines.length > 7) {
        return {
          success: false,
          error: "El plan no puede tener más de 7 rutinas (una por día)",
        };
      }

      // Validar rutinas
      const daysUsed = new Set<number>();
      for (const routine of plan.routines) {
        if (!routine.routineId || routine.routineId <= 0) {
          return { success: false, error: "ID de rutina inválido" };
        }

        if (routine.dayOfWeek < 1 || routine.dayOfWeek > 7) {
          return {
            success: false,
            error:
              "El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)",
          };
        }

        if (daysUsed.has(routine.dayOfWeek)) {
          return {
            success: false,
            error: "No puede haber dos rutinas asignadas al mismo día",
          };
        }

        daysUsed.add(routine.dayOfWeek);
      }

      // Crear el plan
      const planData: CreateTrainingPlanRequest = {
        name: plan.name.trim(),
        userId: plan.userId.trim(),
        startDate: plan.startDate,
        endDate: plan.endDate,
        routines: plan.routines,
      };

      return await this.trainingPlanRepository.crear(planData);
    } catch (error: any) {
      console.error("❌ Error en crear plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar un plan de entrenamiento existente
   */
  async actualizar(id: number, plan: UpdateTrainingPlanRequest) {
    try {
      console.log("🏃 TrainingPlanUseCase - Actualizando plan:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de plan inválido" };
      }

      // Validaciones similares a crear
      if (plan.name !== undefined) {
        if (!plan.name || plan.name.trim().length < 2) {
          return {
            success: false,
            error: "El nombre del plan debe tener al menos 2 caracteres",
          };
        }
        if (plan.name.trim().length > 100) {
          return {
            success: false,
            error: "El nombre del plan no puede exceder 100 caracteres",
          };
        }
      }

      if (plan.startDate !== undefined) {
        if (!plan.startDate) {
          return { success: false, error: "La fecha de inicio es obligatoria" };
        }

        // Validar que la fecha de inicio no sea en el pasado (solo para nuevos planes)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(plan.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (startDate < today) {
          return {
            success: false,
            error: "La fecha de inicio no puede ser anterior a hoy",
          };
        }
      }

      if (plan.endDate !== undefined && plan.endDate && plan.startDate) {
        const endDate = new Date(plan.endDate);
        const startDate = new Date(plan.startDate);
        endDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        if (endDate <= startDate) {
          return {
            success: false,
            error: "La fecha de fin debe ser posterior a la fecha de inicio",
          };
        }
      }

      if (plan.routines !== undefined) {
        if (plan.routines.length === 0) {
          return {
            success: false,
            error: "El plan debe tener al menos una rutina asignada",
          };
        }

        if (plan.routines.length > 7) {
          return {
            success: false,
            error: "El plan no puede tener más de 7 rutinas (una por día)",
          };
        }

        // Validar rutinas
        const daysUsed = new Set<number>();
        for (const routine of plan.routines) {
          if (!routine.routineId || routine.routineId <= 0) {
            return { success: false, error: "ID de rutina inválido" };
          }

          if (routine.dayOfWeek < 1 || routine.dayOfWeek > 7) {
            return {
              success: false,
              error:
                "El día de la semana debe estar entre 1 (Lunes) y 7 (Domingo)",
            };
          }

          if (daysUsed.has(routine.dayOfWeek)) {
            return {
              success: false,
              error: "No puede haber dos rutinas asignadas al mismo día",
            };
          }

          daysUsed.add(routine.dayOfWeek);
        }
      }

      const planData: UpdateTrainingPlanRequest = {
        name: plan.name?.trim(),
        startDate: plan.startDate,
        endDate: plan.endDate,
        routines: plan.routines,
      };

      return await this.trainingPlanRepository.actualizar(id, planData);
    } catch (error: any) {
      console.error("❌ Error en actualizar plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un plan de entrenamiento
   */
  async eliminar(id: number) {
    try {
      console.log("🏃 TrainingPlanUseCase - Eliminando plan:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de plan inválido" };
      }

      return await this.trainingPlanRepository.eliminar(id);
    } catch (error: any) {
      console.error("❌ Error en eliminar plan:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuarios disponibles para asignar planes
   */
  async obtenerUsuariosDisponibles() {
    try {
      console.log("👥 TrainingPlanUseCase - Obteniendo usuarios disponibles");
      return await this.trainingPlanRepository.obtenerUsuariosDisponibles();
    } catch (error: any) {
      console.error("❌ Error en obtenerUsuariosDisponibles:", error);
      return { success: false, error: error.message };
    }
  }
}

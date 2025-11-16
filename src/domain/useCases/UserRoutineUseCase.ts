import {
  DailyRoutine,
  IUserRoutineRepository,
  WeeklyPlan,
} from "../repositories";
import { IUserRoutineUseCase } from "./IUserRoutineUseCase";

/**
 * UserRoutineUseCase - Implementación concreta para casos de uso de rutinas del usuario
 *
 * Maneja la lógica de negocio para que los usuarios gestionen sus rutinas asignadas.
 */
export class UserRoutineUseCase implements IUserRoutineUseCase {
  constructor(private userRoutineRepository: IUserRoutineRepository) {}

  /**
   * Obtener la rutina del día actual
   */
  async obtenerRutinaDeHoy(
    userId: string
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.userRoutineRepository.obtenerRutinaDelDia(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Si no hay rutina para hoy, no es un error
      if (!result.data) {
        return {
          success: true,
          data: undefined,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en obtenerRutinaDeHoy:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener rutina de un día específico de la semana
   */
  async obtenerRutinaDeDia(
    userId: string,
    dayOfWeek: number
  ): Promise<{ success: boolean; data?: DailyRoutine; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return { success: false, error: "Día de la semana inválido (0-6)" };
      }

      // Por ahora, solo obtenemos la rutina del día actual
      // Cuando tengamos una función específica para días, la usaremos
      const result = await this.userRoutineRepository.obtenerRutinaDelDia(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Filtrar por día específico si coincide
      if (result.data && result.data.dayOfWeek === dayOfWeek) {
        return { success: true, data: result.data };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error en obtenerRutinaDeDia:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener el plan semanal completo
   */
  async obtenerPlanSemanal(
    userId: string
  ): Promise<{ success: boolean; data?: WeeklyPlan; error?: string }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.userRoutineRepository.obtenerPlanSemanal(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error en obtenerPlanSemanal:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Verificar si tiene un plan activo
   */
  async verificarPlanActivo(userId: string): Promise<{
    success: boolean;
    data?: {
      hasPlan: boolean;
      planId?: number;
      planName?: string;
      trainerName?: string;
      startDate?: Date;
      endDate?: Date;
      daysRemaining?: number;
      completionPercentage?: number;
    };
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const result = await this.userRoutineRepository.verificarPlanActivo(
        userId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (!result.data?.hasPlan) {
        return {
          success: true,
          data: { hasPlan: false },
        };
      }

      // Calcular días restantes y porcentaje de completitud
      let daysRemaining: number | undefined;
      let completionPercentage: number | undefined;

      if (result.data.startDate && result.data.endDate) {
        const now = new Date();
        const endDate = result.data.endDate;
        const startDate = result.data.startDate;

        const totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const elapsedDays = Math.ceil(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        daysRemaining = Math.max(
          0,
          Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        completionPercentage = Math.min(
          100,
          Math.max(0, (elapsedDays / totalDays) * 100)
        );
      }

      return {
        success: true,
        data: {
          ...result.data,
          daysRemaining,
          completionPercentage,
        },
      };
    } catch (error) {
      console.error("Error en verificarPlanActivo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener ejercicios detallados de una rutina
   */
  async obtenerEjerciciosDetallados(routineId: number): Promise<{
    success: boolean;
    data?: {
      id: number;
      name: string;
      description?: string;
      videoUrl?: string;
      sets?: number;
      reps?: string;
      restSeconds?: number;
      order: number;
      muscleGroups?: string[];
      equipment?: string[];
      difficulty?: "beginner" | "intermediate" | "advanced";
    }[];
    error?: string;
  }> {
    try {
      if (!routineId) {
        return { success: false, error: "ID de rutina requerido" };
      }

      const result = await this.userRoutineRepository.obtenerEjerciciosDeRutina(
        routineId
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Extender los datos básicos con información adicional por defecto
      const extendedExercises = result.data?.map((exercise) => ({
        ...exercise,
        muscleGroups: [], // Se puede obtener de otra tabla si existe
        equipment: [], // Se puede obtener de otra tabla si existe
        difficulty: "intermediate" as const, // Valor por defecto
      }));

      return {
        success: true,
        data: extendedExercises || [],
      };
    } catch (error) {
      console.error("Error en obtenerEjerciciosDetallados:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener progreso semanal
   */
  async obtenerProgresoSemanal(userId: string): Promise<{
    success: boolean;
    data?: {
      weekStart: Date;
      weekEnd: Date;
      totalRoutines: number;
      completedRoutines: number;
      completionPercentage: number;
      dailyProgress: {
        date: Date;
        dayName: string;
        hasRoutine: boolean;
        completed: boolean;
        routineName?: string;
        completedAt?: Date;
        durationMinutes?: number;
      }[];
    };
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      const planResult = await this.userRoutineRepository.obtenerPlanSemanal(
        userId
      );

      if (!planResult.success || !planResult.data) {
        return {
          success: true,
          data: {
            weekStart: new Date(),
            weekEnd: new Date(),
            totalRoutines: 0,
            completedRoutines: 0,
            completionPercentage: 0,
            dailyProgress: [],
          },
        };
      }

      const plan = planResult.data;
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const dailyProgress = plan.routines.map((routine) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + routine.dayOfWeek);

        return {
          date,
          dayName: routine.dayName,
          hasRoutine: !!routine.routine,
          completed: routine.completedThisWeek,
          routineName: routine.routine?.name,
          completedAt: undefined, // Se puede obtener de workout_logs si se necesita
          durationMinutes: undefined,
        };
      });

      const totalRoutines = dailyProgress.filter(
        (day) => day.hasRoutine
      ).length;
      const completedRoutines = dailyProgress.filter(
        (day) => day.completed
      ).length;
      const completionPercentage =
        totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;

      return {
        success: true,
        data: {
          weekStart,
          weekEnd,
          totalRoutines,
          completedRoutines,
          completionPercentage,
          dailyProgress,
        },
      };
    } catch (error) {
      console.error("Error en obtenerProgresoSemanal:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener calendario de entrenamientos (mes completo)
   */
  async obtenerCalendarioMensual(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    success: boolean;
    data?: {
      date: string;
      hasRoutine: boolean;
      routineName?: string;
      completed: boolean;
      completedAt?: Date;
      durationMinutes?: number;
      dayOfWeek: number;
    }[];
    error?: string;
  }> {
    try {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      if (year < 2020 || year > 2030) {
        return { success: false, error: "Año inválido" };
      }

      if (month < 1 || month > 12) {
        return { success: false, error: "Mes inválido (1-12)" };
      }

      // Obtener el plan semanal para conocer las rutinas asignadas
      const planResult = await this.userRoutineRepository.obtenerPlanSemanal(
        userId
      );

      if (!planResult.success) {
        return { success: false, error: planResult.error };
      }

      // Generar calendario del mes
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const calendar = [];

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month - 1, day);
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split("T")[0];

        // Buscar si hay rutina asignada para este día de la semana
        const routineForDay = planResult.data?.routines.find(
          (r) => r.dayOfWeek === dayOfWeek
        );

        calendar.push({
          date: dateStr,
          hasRoutine: !!routineForDay?.routine,
          routineName: routineForDay?.routine?.name,
          completed: false, // Se puede obtener de workout_logs si se implementa
          completedAt: undefined,
          durationMinutes: undefined,
          dayOfWeek,
        });
      }

      return {
        success: true,
        data: calendar,
      };
    } catch (error) {
      console.error("Error en obtenerCalendarioMensual:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}

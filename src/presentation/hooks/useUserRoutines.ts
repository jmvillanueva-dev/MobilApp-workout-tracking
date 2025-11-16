import { useCallback, useEffect, useState } from "react";
import { DailyRoutine, WeeklyPlan } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Hook para manejar las rutinas del usuario
 */
export const useUserRoutines = (userId?: string) => {
  const { userRoutineUseCase } = useDependencies();

  // Estados
  const [todayRoutine, setTodayRoutine] = useState<DailyRoutine | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [activePlan, setActivePlan] = useState<any>(null);

  // Estados de carga
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Estados de error
  const [todayError, setTodayError] = useState<string | null>(null);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  /**
   * Obtener rutina del día actual
   */
  const fetchTodayRoutine = useCallback(async () => {
    if (!userId) return;

    setIsLoadingToday(true);
    setTodayError(null);

    try {
      const result = await userRoutineUseCase.obtenerRutinaDeHoy(userId);

      if (result.success) {
        setTodayRoutine(result.data || null);
      } else {
        setTodayError(result.error || "Error obteniendo rutina del día");
      }
    } catch (error) {
      setTodayError(
        error instanceof Error ? error.message : "Error inesperado"
      );
    } finally {
      setIsLoadingToday(false);
    }
  }, [userId, userRoutineUseCase]);

  /**
   * Obtener plan semanal completo
   */
  const fetchWeeklyPlan = useCallback(async () => {
    if (!userId) return;

    setIsLoadingWeekly(true);
    setWeeklyError(null);

    try {
      const result = await userRoutineUseCase.obtenerPlanSemanal(userId);

      if (result.success) {
        setWeeklyPlan(result.data || null);
      } else {
        setWeeklyError(result.error || "Error obteniendo plan semanal");
      }
    } catch (error) {
      setWeeklyError(
        error instanceof Error ? error.message : "Error inesperado"
      );
    } finally {
      setIsLoadingWeekly(false);
    }
  }, [userId, userRoutineUseCase]);

  /**
   * Verificar si tiene plan activo
   */
  const fetchActivePlan = useCallback(async () => {
    if (!userId) return;

    setIsLoadingPlan(true);
    setPlanError(null);

    try {
      const result = await userRoutineUseCase.verificarPlanActivo(userId);

      if (result.success) {
        setActivePlan(result.data || null);
      } else {
        setPlanError(result.error || "Error verificando plan activo");
      }
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoadingPlan(false);
    }
  }, [userId, userRoutineUseCase]);

  /**
   * Obtener ejercicios de una rutina específica
   */
  const getExercises = useCallback(
    async (routineId: number) => {
      try {
        const result = await userRoutineUseCase.obtenerEjerciciosDetallados(
          routineId
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error obteniendo ejercicios",
        };
      }
    },
    [userRoutineUseCase]
  );

  /**
   * Obtener progreso semanal
   */
  const getWeeklyProgress = useCallback(async () => {
    if (!userId) {
      return { success: false, error: "ID de usuario requerido" };
    }

    try {
      const result = await userRoutineUseCase.obtenerProgresoSemanal(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error obteniendo progreso semanal",
      };
    }
  }, [userId, userRoutineUseCase]);

  /**
   * Obtener calendario mensual
   */
  const getMonthlyCalendar = useCallback(
    async (year: number, month: number) => {
      if (!userId) {
        return { success: false, error: "ID de usuario requerido" };
      }

      try {
        const result = await userRoutineUseCase.obtenerCalendarioMensual(
          userId,
          year,
          month
        );
        return result;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error obteniendo calendario",
        };
      }
    },
    [userId, userRoutineUseCase]
  );

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(() => {
    fetchTodayRoutine();
    fetchWeeklyPlan();
    fetchActivePlan();
  }, [fetchTodayRoutine, fetchWeeklyPlan, fetchActivePlan]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    setTodayError(null);
    setWeeklyError(null);
    setPlanError(null);
  }, []);

  // Efectos
  useEffect(() => {
    if (userId) {
      fetchTodayRoutine();
      fetchActivePlan();
    }
  }, [userId, fetchTodayRoutine, fetchActivePlan]);

  // Estados computados
  const hasActivePlan = activePlan?.hasPlan || false;
  const isLoading = isLoadingToday || isLoadingWeekly || isLoadingPlan;
  const hasErrors =
    todayError !== null || weeklyError !== null || planError !== null;

  return {
    // Datos
    todayRoutine,
    weeklyPlan,
    activePlan,

    // Estados
    isLoading,
    isLoadingToday,
    isLoadingWeekly,
    isLoadingPlan,
    hasActivePlan,
    hasErrors,

    // Errores
    todayError,
    weeklyError,
    planError,

    // Acciones
    fetchTodayRoutine,
    fetchWeeklyPlan,
    fetchActivePlan,
    getExercises,
    getWeeklyProgress,
    getMonthlyCalendar,
    refreshAll,
    clearErrors,
  };
};

import { useEffect, useState } from "react";
import { TrainingPlan } from "../../domain/models";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * Hook para gestionar planes de entrenamiento
 * Versión simplificada para evitar errores de tipos
 */
export function useTrainingPlans() {
  const { trainingPlanUseCase } = useDependencies();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar mis planes de entrenamiento (como entrenador)
   */
  const loadTrainingPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando planes de entrenamiento...");

      // Obtener los planes usando el use case real
      const result = await trainingPlanUseCase.obtenerMisPlanes();

      if (result.success) {
        const plans = (result as any).data || [];
        setTrainingPlans(plans);
        console.log(`✅ ${plans.length} planes cargados`);
      } else {
        console.error("❌ Error cargando planes:", result.error);
        setError(result.error || "Error cargando planes");
        setTrainingPlans([]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("❌ Error inesperado:", error);
      setTrainingPlans([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener planes asignados a un usuario específico
   */
  const getAssignedPlans = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando planes para usuario:", userId);

      // Placeholder implementation
      setTrainingPlans([]);
      console.log("✅ 0 planes asignados al usuario (placeholder)");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener usuarios disponibles para asignar planes
   */
  const getAvailableUsers = async () => {
    try {
      setError(null);
      console.log("🔄 Obteniendo usuarios disponibles...");

      const result = await trainingPlanUseCase.obtenerUsuariosDisponibles();

      if (result.success) {
        const users = (result as any).data || [];
        console.log("✅ Usuarios disponibles obtenidos:", users.length);
        return users;
      } else {
        setError(result.error || "Error obteniendo usuarios");
        return [];
      }
    } catch (error: any) {
      setError(error.message);
      console.error("❌ Error obteniendo usuarios:", error);
      return [];
    }
  };

  /**
   * Crear plan de entrenamiento
   */
  const createTrainingPlan = async (planData: {
    name: string;
    userId: string;
    startDate: string;
    endDate?: string;
    routines: {
      routineId: number;
      dayOfWeek: number;
    }[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Creando plan de entrenamiento:", planData);

      // Preparar los datos para el use case
      const createRequest = {
        name: planData.name,
        userId: planData.userId,
        startDate: new Date(planData.startDate),
        endDate: planData.endDate ? new Date(planData.endDate) : undefined,
        routines: planData.routines.map((routine) => ({
          routineId: routine.routineId,
          dayOfWeek: routine.dayOfWeek,
        })),
      };

      console.log("📝 DEBUG - Datos formateados para use case:", createRequest);

      // Crear el plan usando el use case real
      const result = await trainingPlanUseCase.crear(createRequest);

      if (result.success) {
        console.log("✅ Plan creado exitosamente:", (result as any).data);

        // Recargar la lista de planes
        await loadTrainingPlans();

        return (result as any).data;
      } else {
        console.error("❌ Error creando plan:", result.error);
        setError(result.error || "Error desconocido al crear plan");
        throw new Error(result.error || "Error desconocido al crear plan");
      }
    } catch (error: any) {
      console.error("❌ Error inesperado en createTrainingPlan:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar planes
   */
  const refreshPlans = async () => {
    await loadTrainingPlans();
  };

  // Inicialización del hook
  useEffect(() => {
    // No llamamos automáticamente para evitar errores en el use case
    console.log("🎯 Hook useTrainingPlans inicializado");
  }, []);

  return {
    trainingPlans,
    loading,
    error,
    loadTrainingPlans,
    getAssignedPlans,
    getAvailableUsers,
    createTrainingPlan,
    refreshPlans,
  };
}

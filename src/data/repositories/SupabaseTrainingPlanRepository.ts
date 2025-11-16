import {
  CreateTrainingPlanRequest,
  PlanRoutine,
  TrainingPlan,
  UpdateTrainingPlanRequest,
} from "../../domain/models";
import { ITrainingPlanRepository } from "../../domain/repositories/ITrainingPlanRepository";
import { supabase } from "../services/supabaseClient";

/**
 * SupabaseTrainingPlanRepository - Implementación concreta del repositorio de planes de entrenamiento
 */
export class SupabaseTrainingPlanRepository implements ITrainingPlanRepository {
  /**
   * Obtener planes del entrenador actualmente logueado
   */
  async obtenerPorEntrenadorActual(): Promise<{
    success: boolean;
    data?: TrainingPlan[];
    error?: string;
  }> {
    try {
      console.log("🏃 Obteniendo planes del entrenador actual...");

      // Obtener el usuario autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("❌ Error de autenticación:", authError);
        return {
          success: false,
          error: "Error de autenticación: " + authError.message,
        };
      }

      if (!user) {
        console.error("❌ Usuario no autenticado");
        return { success: false, error: "Usuario no autenticado" };
      }

      console.log("✅ Usuario autenticado como entrenador:", user.id);

      // Usar el método existente obtenerPorEntrenador
      return await this.obtenerPorEntrenador(user.id);
    } catch (error: any) {
      console.error(
        "❌ Error inesperado obteniendo planes del entrenador actual:",
        error
      );
      return { success: false, error: error.message };
    }
  }

  async obtenerPorEntrenador(
    trainerId: string
  ): Promise<{ success: boolean; data?: TrainingPlan[]; error?: string }> {
    try {
      console.log("🏃 Obteniendo planes del entrenador:", trainerId);

      const { data, error } = await supabase
        .from("training_plans")
        .select(
          `
          *,
          profiles!user_id(id, full_name),
          plan_routines(
            *,
            routines(id, name, description)
          )
        `
        )
        .eq("trainer_id", trainerId)
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Error obteniendo planes del entrenador:", error);
        return { success: false, error: error.message };
      }

      const plans: TrainingPlan[] = data.map((item) =>
        this.mapToTrainingPlan(item)
      );
      console.log(`✅ ${plans.length} planes del entrenador obtenidos`);
      return { success: true, data: plans };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPorUsuario(
    userId: string
  ): Promise<{ success: boolean; data?: TrainingPlan[]; error?: string }> {
    try {
      console.log("🏃 Obteniendo planes del usuario:", userId);

      const { data, error } = await supabase
        .from("training_plans")
        .select(
          `
          *,
          profiles!trainer_id(id, full_name),
          plan_routines(
            *,
            routines(id, name, description)
          )
        `
        )
        .eq("user_id", userId)
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Error obteniendo planes del usuario:", error);
        return { success: false, error: error.message };
      }

      const plans: TrainingPlan[] = data.map((item) =>
        this.mapToTrainingPlan(item)
      );
      console.log(`✅ ${plans.length} planes del usuario obtenidos`);
      return { success: true, data: plans };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }> {
    try {
      console.log("🏃 Obteniendo plan por ID:", id);

      const { data, error } = await supabase
        .from("training_plans")
        .select(
          `
          *,
          profiles!user_id(id, full_name),
          profiles!trainer_id(id, full_name),
          plan_routines(
            *,
            routines(id, name, description)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error obteniendo plan:", error);
        return { success: false, error: error.message };
      }

      const plan = this.mapToTrainingPlan(data);
      console.log("✅ Plan obtenido exitosamente");
      return { success: true, data: plan };
    } catch (error: any) {
      console.error("❌ Error inesperado:", error);
      return { success: false, error: error.message };
    }
  }

  async crear(
    plan: CreateTrainingPlanRequest
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }> {
    try {
      console.log("🏃 Creando nuevo plan:", plan.name);
      console.log("📝 DEBUG - Datos del plan a crear:", {
        name: plan.name,
        userId: plan.userId,
        startDate: plan.startDate,
        endDate: plan.endDate,
        routines: plan.routines?.length || 0,
      });

      // Verificar autenticación
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("❌ Error de autenticación:", authError);
        return {
          success: false,
          error: "Error de autenticación: " + authError.message,
        };
      }

      if (!user) {
        console.error("❌ Usuario no autenticado");
        return { success: false, error: "Usuario no autenticado" };
      }

      console.log("✅ Usuario autenticado:", user.id);

      // Verificar rol del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Error obteniendo perfil:", profileError);
        return {
          success: false,
          error: "Error verificando rol: " + profileError.message,
        };
      }

      console.log("👤 Rol del usuario:", profile?.role);

      if (profile?.role !== "entrenador") {
        console.error("❌ Usuario no es entrenador");
        return {
          success: false,
          error: "Solo los entrenadores pueden crear planes",
        };
      }

      // Preparar datos para inserción
      const planInsertData = {
        name: plan.name,
        user_id: plan.userId,
        trainer_id: user.id,
        start_date: plan.startDate.toISOString().split("T")[0],
        end_date: plan.endDate
          ? plan.endDate.toISOString().split("T")[0]
          : null,
      };

      console.log(
        "📝 DEBUG - Datos a insertar en training_plans:",
        planInsertData
      );

      // Crear el plan
      const { data: planData, error: planError } = await supabase
        .from("training_plans")
        .insert(planInsertData)
        .select()
        .single();

      if (planError) {
        console.error("❌ Error creando plan:", planError);
        console.error("🔍 Código de error:", planError.code);
        console.error("🔍 Detalles:", planError.details);
        console.error("🔍 Hint:", planError.hint);
        return {
          success: false,
          error: `Error creando plan: ${planError.message}`,
        };
      }

      console.log("✅ Plan creado exitosamente:", planData);

      // Crear las rutinas del plan
      if (plan.routines && plan.routines.length > 0) {
        const routineData = plan.routines.map((routine) => ({
          plan_id: planData.id,
          routine_id: routine.routineId,
          day_of_week: routine.dayOfWeek,
        }));

        console.log("📝 DEBUG - Datos de rutinas a insertar:", routineData);

        const { error: routineError } = await supabase
          .from("plan_routines")
          .insert(routineData);

        if (routineError) {
          console.error("❌ Error creando rutinas del plan:", routineError);
          console.error("🔍 Código de error rutinas:", routineError.code);
          console.error("🔍 Detalles rutinas:", routineError.details);
          // No retornar error aquí, el plan ya se creó
          console.log("⚠️ Plan creado pero sin rutinas asignadas");
        } else {
          console.log("✅ Rutinas del plan creadas exitosamente");
        }
      }

      // Obtener el plan completo
      const planResult = await this.obtenerPorId(planData.id);
      if (planResult.success) {
        console.log("✅ Plan completo obtenido exitosamente");
        return planResult;
      } else {
        console.log("⚠️ Plan creado pero error obteniendo datos completos");
        // Retornar los datos básicos del plan creado
        return {
          success: true,
          data: {
            id: planData.id,
            name: planData.name,
            userId: planData.user_id,
            trainerId: planData.trainer_id,
            startDate: new Date(planData.start_date),
            endDate: planData.end_date
              ? new Date(planData.end_date)
              : undefined,
            routines: [],
            createdAt: new Date(planData.created_at),
          } as TrainingPlan,
        };
      }
    } catch (error: any) {
      console.error("❌ Error inesperado al crear plan:", error);
      console.error("🔍 Stack trace:", error.stack);
      return { success: false, error: `Error inesperado: ${error.message}` };
    }
  }

  async actualizar(
    id: number,
    plan: UpdateTrainingPlanRequest
  ): Promise<{ success: boolean; data?: TrainingPlan; error?: string }> {
    try {
      console.log("🏃 Actualizando plan:", id);

      // Actualizar información básica del plan
      const updateData: any = {};
      if (plan.name !== undefined) updateData.name = plan.name;
      if (plan.startDate !== undefined)
        updateData.start_date = plan.startDate.toISOString().split("T")[0];
      if (plan.endDate !== undefined)
        updateData.end_date = plan.endDate
          ? plan.endDate.toISOString().split("T")[0]
          : null;

      if (Object.keys(updateData).length > 0) {
        const { error: planError } = await supabase
          .from("training_plans")
          .update(updateData)
          .eq("id", id);

        if (planError) {
          console.error("❌ Error actualizando plan:", planError);
          return { success: false, error: planError.message };
        }
      }

      // Actualizar rutinas si se proporcionaron
      if (plan.routines) {
        // Eliminar rutinas existentes
        const { error: deleteError } = await supabase
          .from("plan_routines")
          .delete()
          .eq("plan_id", id);

        if (deleteError) {
          console.error("❌ Error eliminando rutinas existentes:", deleteError);
          return { success: false, error: deleteError.message };
        }

        // Insertar nuevas rutinas
        if (plan.routines.length > 0) {
          const routineData = plan.routines.map((routine) => ({
            plan_id: id,
            routine_id: routine.routineId,
            day_of_week: routine.dayOfWeek,
          }));

          const { error: insertError } = await supabase
            .from("plan_routines")
            .insert(routineData);

          if (insertError) {
            console.error("❌ Error insertando nuevas rutinas:", insertError);
            return { success: false, error: insertError.message };
          }
        }
      }

      // Obtener el plan actualizado
      return await this.obtenerPorId(id);
    } catch (error: any) {
      console.error("❌ Error inesperado al actualizar plan:", error);
      return { success: false, error: error.message };
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🏃 Eliminando plan:", id);

      const { error } = await supabase
        .from("training_plans")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Error eliminando plan:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Plan eliminado exitosamente");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Error inesperado al eliminar plan:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerUsuariosDisponibles(): Promise<{
    success: boolean;
    data?: { id: string; fullName: string; email: string }[];
    error?: string;
  }> {
    try {
      console.log("👥 Obteniendo usuarios disponibles...");

      // Verificar información de autenticación actual
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("🔍 DEBUG - Usuario autenticado:", user?.id);
      console.log("🔍 DEBUG - Error de auth:", authError);

      // Obtener información del perfil del usuario actual para verificar RLS
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user?.id || "")
        .single();

      console.log("🔍 DEBUG - Perfil actual:", currentProfile);
      console.log("🔍 DEBUG - Error perfil actual:", profileError);

      // Primero verificar todos los profiles para debug
      const { data: allData, error: allError } = await supabase
        .from("profiles")
        .select("id, full_name, role");

      console.log("🔍 DEBUG - Todos los profiles:", allData);
      console.log("🔍 DEBUG - Total profiles:", allData?.length || 0);
      console.log("🔍 DEBUG - Error consulta general:", allError);

      // Obtener usuarios con rol 'usuario' específicamente
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("role", "usuario")
        .order("full_name");

      console.log("🔍 DEBUG - Profiles con rol usuario:", profilesData);
      console.log("🔍 DEBUG - Error en consulta filtrada:", profilesError);

      if (profilesError) {
        console.error("❌ Error obteniendo profiles:", profilesError);
        return { success: false, error: profilesError.message };
      }

      if (!profilesData || profilesData.length === 0) {
        console.log("⚠️ No se encontraron usuarios con rol 'usuario'");
        console.log(
          "💡 SOLUCIÓN: Ejecutar el archivo 'supabase-rls-profiles-fix.sql' en Supabase"
        );

        // Datos mock temporales para testing mientras se arregla RLS
        console.log("📝 Usando usuarios mock temporales para desarrollo");
        const mockUsers = [
          {
            id: "mock-user-1",
            fullName: "Usuario Demo 1",
            email: "demo1@ejemplo.com",
          },
          {
            id: "mock-user-2",
            fullName: "Usuario Demo 2",
            email: "demo2@ejemplo.com",
          },
          {
            id: "mock-user-3",
            fullName: "Usuario Demo 3",
            email: "demo3@ejemplo.com",
          },
        ];

        return { success: true, data: mockUsers };
      }

      // Mapear a formato esperado
      const result = profilesData.map((profile) => ({
        id: profile.id,
        fullName: profile.full_name || "Usuario sin nombre",
        email: "", // No disponible en la tabla profiles
      }));

      console.log(
        `✅ ${result.length} usuarios disponibles obtenidos:`,
        result
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error("❌ Error inesperado obteniendo usuarios:", error);
      return { success: false, error: error.message };
    }
  }

  private mapToTrainingPlan(data: any): TrainingPlan {
    const routines: PlanRoutine[] = (data.plan_routines || [])
      .map((item: any) => ({
        id: item.id,
        planId: item.plan_id,
        routineId: item.routine_id,
        dayOfWeek: item.day_of_week,
        routine: item.routines
          ? {
              id: item.routines.id,
              name: item.routines.name,
              description: item.routines.description,
            }
          : undefined,
      }))
      .sort((a: PlanRoutine, b: PlanRoutine) => a.dayOfWeek - b.dayOfWeek);

    // Manejar los perfiles (pueden venir con nombres diferentes dependiendo de la consulta)
    const userProfile =
      data.profiles ||
      (Array.isArray(data.profiles)
        ? data.profiles.find((p: any) => p.id === data.user_id)
        : null);
    const trainerProfile =
      data.profiles ||
      (Array.isArray(data.profiles)
        ? data.profiles.find((p: any) => p.id === data.trainer_id)
        : null);

    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      trainerId: data.trainer_id,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      routines,
      user: userProfile
        ? {
            id: userProfile.id,
            fullName: userProfile.full_name || "Usuario",
            email: "", // Campo no disponible en la tabla profiles
          }
        : undefined,
      trainer: trainerProfile
        ? {
            id: trainerProfile.id,
            fullName: trainerProfile.full_name || "Entrenador",
            email: "", // Campo no disponible en la tabla profiles
          }
        : undefined,
      createdAt: new Date(), // Campo no disponible en la tabla training_plans
      updatedAt: undefined, // Campo no disponible en la tabla training_plans
    };
  }
}

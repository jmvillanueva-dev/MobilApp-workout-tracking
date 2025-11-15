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
          profiles!user_id(id, full_name, email),
          plan_routines(
            *,
            routines(id, name, description)
          )
        `
        )
        .eq("trainer_id", trainerId)
        .order("created_at", { ascending: false });

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
          profiles!trainer_id(id, full_name, email),
          plan_routines(
            *,
            routines(id, name, description)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

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
          profiles!user_id(id, full_name, email),
          profiles!trainer_id(id, full_name, email),
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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      // Crear el plan
      const { data: planData, error: planError } = await supabase
        .from("training_plans")
        .insert({
          name: plan.name,
          user_id: plan.userId,
          trainer_id: user.id,
          start_date: plan.startDate.toISOString().split("T")[0],
          end_date: plan.endDate
            ? plan.endDate.toISOString().split("T")[0]
            : null,
        })
        .select()
        .single();

      if (planError) {
        console.error("❌ Error creando plan:", planError);
        return { success: false, error: planError.message };
      }

      // Crear las rutinas del plan
      if (plan.routines && plan.routines.length > 0) {
        const routineData = plan.routines.map((routine) => ({
          plan_id: planData.id,
          routine_id: routine.routineId,
          day_of_week: routine.dayOfWeek,
        }));

        const { error: routineError } = await supabase
          .from("plan_routines")
          .insert(routineData);

        if (routineError) {
          console.error("❌ Error creando rutinas del plan:", routineError);
          return { success: false, error: routineError.message };
        }
      }

      // Obtener el plan completo
      return await this.obtenerPorId(planData.id);
    } catch (error: any) {
      console.error("❌ Error inesperado al crear plan:", error);
      return { success: false, error: error.message };
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

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "usuario")
        .order("full_name");

      if (error) {
        console.error("❌ Error obteniendo usuarios:", error);
        return { success: false, error: error.message };
      }

      const users = data.map((user) => ({
        id: user.id,
        fullName: user.full_name || user.email || "Usuario sin nombre",
        email: user.email || "",
      }));

      console.log(`✅ ${users.length} usuarios disponibles obtenidos`);
      return { success: true, data: users };
    } catch (error: any) {
      console.error("❌ Error inesperado al obtener usuarios:", error);
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
            fullName: userProfile.full_name || userProfile.email || "Usuario",
            email: userProfile.email || "",
          }
        : undefined,
      trainer: trainerProfile
        ? {
            id: trainerProfile.id,
            fullName:
              trainerProfile.full_name || trainerProfile.email || "Entrenador",
            email: trainerProfile.email || "",
          }
        : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }
}

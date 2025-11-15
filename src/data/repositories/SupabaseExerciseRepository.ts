import {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from "../../domain/models";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { supabase } from "../services/supabaseClient";

/**
 * SupabaseExerciseRepository - Implementación concreta del repositorio de ejercicios
 *
 * Utiliza Supabase como backend para realizar operaciones CRUD sobre ejercicios.
 */
export class SupabaseExerciseRepository implements IExerciseRepository {
  async obtenerTodos(): Promise<{
    success: boolean;
    data?: Exercise[];
    error?: string;
  }> {
    try {
      console.log("💪 Obteniendo todos los ejercicios...");

      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
          *,
          profiles!created_by(full_name)
        `
        )
        .order("name");

      if (error) {
        console.error("❌ Error obteniendo ejercicios:", error);
        return { success: false, error: error.message };
      }

      const exercises: Exercise[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        videoUrl: item.video_url,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
      }));

      console.log(`✅ ${exercises.length} ejercicios obtenidos exitosamente`);
      return { success: true, data: exercises };
    } catch (error: any) {
      console.error("❌ Error inesperado al obtener ejercicios:", error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPorEntrenador(
    trainerId: string
  ): Promise<{ success: boolean; data?: Exercise[]; error?: string }> {
    try {
      console.log("💪 Obteniendo ejercicios del entrenador:", trainerId);

      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("created_by", trainerId)
        .order("name");

      if (error) {
        console.error("❌ Error obteniendo ejercicios del entrenador:", error);
        return { success: false, error: error.message };
      }

      const exercises: Exercise[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        videoUrl: item.video_url,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
      }));

      console.log(`✅ ${exercises.length} ejercicios del entrenador obtenidos`);
      return { success: true, data: exercises };
    } catch (error: any) {
      console.error(
        "❌ Error inesperado al obtener ejercicios del entrenador:",
        error
      );
      return { success: false, error: error.message };
    }
  }

  async obtenerPorId(
    id: number
  ): Promise<{ success: boolean; data?: Exercise; error?: string }> {
    try {
      console.log("💪 Obteniendo ejercicio por ID:", id);

      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error obteniendo ejercicio:", error);
        return { success: false, error: error.message };
      }

      const exercise: Exercise = {
        id: data.id,
        name: data.name,
        description: data.description,
        videoUrl: data.video_url,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      };

      console.log("✅ Ejercicio obtenido exitosamente");
      return { success: true, data: exercise };
    } catch (error: any) {
      console.error("❌ Error inesperado al obtener ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  async crear(
    ejercicio: CreateExerciseRequest
  ): Promise<{ success: boolean; data?: Exercise; error?: string }> {
    try {
      console.log("💪 Creando nuevo ejercicio:", ejercicio.name);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("exercises")
        .insert({
          name: ejercicio.name,
          description: ejercicio.description,
          video_url: ejercicio.videoUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creando ejercicio:", error);
        return { success: false, error: error.message };
      }

      const newExercise: Exercise = {
        id: data.id,
        name: data.name,
        description: data.description,
        videoUrl: data.video_url,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
      };

      console.log("✅ Ejercicio creado exitosamente");
      return { success: true, data: newExercise };
    } catch (error: any) {
      console.error("❌ Error inesperado al crear ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  async actualizar(
    id: number,
    ejercicio: UpdateExerciseRequest
  ): Promise<{ success: boolean; data?: Exercise; error?: string }> {
    try {
      console.log("💪 Actualizando ejercicio:", id);

      const updateData: any = {};
      if (ejercicio.name !== undefined) updateData.name = ejercicio.name;
      if (ejercicio.description !== undefined)
        updateData.description = ejercicio.description;
      if (ejercicio.videoUrl !== undefined)
        updateData.video_url = ejercicio.videoUrl;

      const { data, error } = await supabase
        .from("exercises")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error actualizando ejercicio:", error);
        return { success: false, error: error.message };
      }

      const updatedExercise: Exercise = {
        id: data.id,
        name: data.name,
        description: data.description,
        videoUrl: data.video_url,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      console.log("✅ Ejercicio actualizado exitosamente");
      return { success: true, data: updatedExercise };
    } catch (error: any) {
      console.error("❌ Error inesperado al actualizar ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("💪 Eliminando ejercicio:", id);

      const { error } = await supabase.from("exercises").delete().eq("id", id);

      if (error) {
        console.error("❌ Error eliminando ejercicio:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Ejercicio eliminado exitosamente");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Error inesperado al eliminar ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  async buscarPorNombre(
    query: string
  ): Promise<{ success: boolean; data?: Exercise[]; error?: string }> {
    try {
      console.log("💪 Buscando ejercicios por nombre:", query);

      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("name");

      if (error) {
        console.error("❌ Error buscando ejercicios:", error);
        return { success: false, error: error.message };
      }

      const exercises: Exercise[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        videoUrl: item.video_url,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
      }));

      console.log(`✅ ${exercises.length} ejercicios encontrados`);
      return { success: true, data: exercises };
    } catch (error: any) {
      console.error("❌ Error inesperado al buscar ejercicios:", error);
      return { success: false, error: error.message };
    }
  }
}

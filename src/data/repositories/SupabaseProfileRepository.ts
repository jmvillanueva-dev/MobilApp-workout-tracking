import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../../domain/models/User";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";

/**
 * Implementación del repositorio de perfiles usando Supabase
 */
export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async actualizarPerfil(
    userId: string,
    updates: Partial<Omit<Profile, "id" | "role">>
  ) {
    try {
      // Validar si hay algo que actualizar
      if (Object.keys(updates).length === 0) {
        return {
          success: true,
          data: undefined,
          message: "No hay nada que actualizar.",
        };
      }

      // Realizar la actualización en la tabla 'profiles'
      const { data, error } = await this.supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select() // devuelve los datos actualizados
        .single();

      if (error) throw error;

      return { success: true, data: data as Profile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async obtenerPerfilPorId(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return { success: true, data: data as Profile };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

import { Profile } from "../models/User";

/**
 * Interfaz para el repositorio de perfiles
 * Define las operaciones de persistencia para perfiles de usuario
 */
export interface IProfileRepository {
  /**
   * Actualiza el perfil del usuario actualmente autenticado
   * @param userId - ID del usuario
   * @param updates - Datos a actualizar (sin incluir avatarUri)
   * @returns El perfil actualizado
   */
  actualizarPerfil(
    userId: string,
    updates: Partial<Omit<Profile, "id" | "role">>
  ): Promise<{
    success: boolean;
    data?: Profile;
    error?: string;
    message?: string;
  }>;

  /**
   * Obtiene un perfil por su ID
   * @param userId - ID del usuario
   * @returns El perfil del usuario
   */
  obtenerPerfilPorId(userId: string): Promise<{
    success: boolean;
    data?: Profile;
    error?: string;
  }>;
}

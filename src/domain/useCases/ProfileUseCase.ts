import { Profile, ProfileUpdateData } from "../models/User";
import { IAuthRepository } from "../repositories/IAuthRepository";
import { IFileRepository } from "../repositories/IFileRepository";
import { IProfileRepository } from "../repositories/IProfileRepository";

/**
 * ProfileUseCase - Caso de Uso de Perfil
 *
 * Lógica de negocio para 'profiles'.
 * NO interactúa con ImagePicker, solo recibe una URI.
 * Usa dependency injection para acceder a los repositorios.
 */
export class ProfileUseCase {
  constructor(
    private profileRepository: IProfileRepository,
    private fileRepository: IFileRepository,
    private authRepository: IAuthRepository
  ) {}

  /**
   * Actualiza el perfil del usuario actualmente autenticado.
   *
   * @param updates - Objeto con los datos a actualizar
   * @returns El perfil actualizado
   */
  async actualizarMiPerfil(updates: ProfileUpdateData) {
    try {
      // 1. Obtener el usuario actual usando el repositorio de auth
      const user = await this.authRepository.getCurrentUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // 2. Preparar objeto de actualización para la DB
      const dbUpdates: Partial<Omit<Profile, "id" | "role">> = {};

      // 3. Si se incluyó una 'avatarUri', subirla primero
      if (updates.avatarUri) {
        const uploadResult = await this.fileRepository.subirAvatar(
          updates.avatarUri,
          user.id
        );
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Error al subir avatar");
        }
        dbUpdates.avatar_url = uploadResult.data;
      }

      // 4. Añadir el nombre si se proporcionó
      if (updates.full_name !== undefined) {
        dbUpdates.full_name = updates.full_name;
      }

      // 5. Actualizar el perfil usando el repositorio
      return await this.profileRepository.actualizarPerfil(user.id, dbUpdates);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener el perfil público de CUALQUIER usuario por su ID
   *
   * @param userId - El ID del usuario (UUID)
   * @returns El perfil público
   */
  async obtenerPerfilPorId(userId: string) {
    return await this.profileRepository.obtenerPerfilPorId(userId);
  }
}

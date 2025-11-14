import { User, UserRole } from "../models/User";
import { IAuthRepository } from "../repositories/IAuthRepository";
import { IStorageRepository } from "../repositories/IStorageRepository";

/**
 * AuthUseCase - Caso de Uso de Autenticación
 *
 * Contiene la lógica de negocio pura para autenticación.
 * Usa dependency injection para no depender de implementaciones concretas.
 * Respeta los principios SOLID y Clean Architecture.
 */
export class AuthUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private storageRepository: IStorageRepository
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async registrar(
    email: string,
    password: string,
    rol: UserRole,
    fullName: string = ""
  ) {
    return await this.authRepository.signUp(email, password, rol, fullName);
  }

  /**
   * Iniciar sesión
   */
  async iniciarSesion(
    email: string,
    password: string,
    recordarSesion: boolean = true
  ) {
    try {
      const resultado = await this.authRepository.signIn(email, password);

      if (!resultado.success) {
        return resultado;
      }

      // Guardar preferencia de recordar sesión
      await this.storageRepository.setItem(
        "wtapp_remember_session", // Usar constante
        recordarSesion.toString()
      );

      // Si el login es exitoso y se debe recordar, guardar datos completos
      if (resultado.user && recordarSesion) {
        const usuarioCompleto = await this.obtenerUsuarioActual();
        if (usuarioCompleto) {
          await this.storageRepository.setObject(
            "wtapp_current_user", // Usar constante
            usuarioCompleto
          );
        }
      }

      return resultado;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const resultado = await this.authRepository.signOut();

      if (resultado.success) {
        // Limpiar datos de sesión guardados localmente
        await this.storageRepository.clearSessionData();
      }

      return resultado;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con toda su información
   */
  async obtenerUsuarioActual(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }

  /**
   * Verificar si hay una sesión persistente almacenada
   */
  async verificarSesionPersistente(): Promise<User | null> {
    try {
      const recordarSesion = await this.storageRepository.getItem(
        "wtapp_remember_session"
      );
      if (recordarSesion === "false") return null;

      // Intentar obtener sesión activa
      const session = await this.authRepository.getSession();

      if (session?.user) {
        // Hay sesión válida, obtener datos completos
        return await this.obtenerUsuarioActual();
      }

      // No hay sesión válida, limpiar datos locales
      await this.storageRepository.clearSessionData();
      return null;
    } catch (error) {
      console.log("Error al verificar sesión persistente:", error);
      return null;
    }
  }

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.authRepository.onAuthStateChange(callback);
  }
}

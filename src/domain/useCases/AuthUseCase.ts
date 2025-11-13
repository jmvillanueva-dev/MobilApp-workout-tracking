import { supabase } from "../../data/services/supabaseClient";
import { StorageService } from "../../data/services/storageService";
import { User, UserRole } from "../models/User";

/**
 * AuthUseCase - Caso de Uso de Autenticación
 *
 * Contiene la lógica de negocio para:
 * - Registro (usando el trigger de Supabase)
 * - Inicio de sesión
 * - Cierre de sesión
 * - Obtener usuario actual (combinando auth + profile)
 *
 * Esta versión está adaptada para usar el trigger `handle_new_user`
 * que crea automáticamente un perfil en la tabla `profiles`.
 */
export class AuthUseCase {
  /**
   * Registrar nuevo usuario (usuario o entrenador)
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @param rol - Rol del nuevo usuario ('usuario' | 'entrenador')
   * @param fullName - (Opcional) Nombre completo
   * @returns Objeto con success y datos o error
   */
  async registrar(email: string, password: string, rol: UserRole, fullName: string = "") {
    try {
      // PASO 1: Crear usuario en Supabase Auth
      // Pasamos el 'rol' y 'fullName' en 'options.data'.
      // Tu trigger 'handle_new_user' leerá esto desde 'raw_user_meta_data'.
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: rol,
            fullName: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("Registro fallido. No se pudo crear el usuario.");

      // Si el usuario requiere confirmación de email
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          needsConfirmation: true,
          message: "Revisa tu email para confirmar la cuenta",
        };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Iniciar sesión
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @param recordarSesion - (Opcional) Si debe guardar la sesión localmente
   * @returns Objeto con success y datos o error
   */
  async iniciarSesion(
    email: string,
    password: string,
    recordarSesion: boolean = true
  ) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Inicio de sesión fallido");

      // Guardar preferencia de recordar sesión
      await StorageService.setItem(
        StorageService.SESSION_REMEMBER_KEY,
        recordarSesion.toString()
      );

      // Si el login es exitoso, obtenemos y guardamos los datos completos
      if (data.user && recordarSesion) {
        const usuarioCompleto = await this.obtenerUsuarioActual();
        if (usuarioCompleto) {
          await StorageService.setObject(
            StorageService.SESSION_USER_KEY,
            usuarioCompleto
          );
        }
      }

      // Devolvemos el usuario de la sesión de Supabase Auth
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cerrar sesión
   */
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar todos los datos de sesión guardados localmente
      await StorageService.limpiarDatosSesion();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual con toda su información
   *
   * @returns Objeto 'User' completo (auth + profile) o null
   */
  async obtenerUsuarioActual(): Promise<User | null> {
    try {
      // PASO 1: Obtener usuario de Auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return null;

      // PASO 2: Obtener información de la tabla 'profiles'
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single(); // Esperamos un solo resultado

      if (error) throw error;
      if (!profileData) {
        // Esto no debería pasar si el trigger funciona, pero es buena idea validarlo
        throw new Error("No se encontró el perfil del usuario.");
      }

      // PASO 3: Combinar datos en nuestro modelo 'User'
      const fullUser: User = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        role: profileData.role,
        full_name: profileData.full_name,
      };

      return fullUser;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  /**
   * Verificar si hay una sesión persistente almacenada
   * (Esta función es usada por el AuthProvider para restaurar la sesión)
   *
   * @returns Usuario guardado localmente o null
   */
  async verificarSesionPersistente(): Promise<User | null> {
    try {
      const recordarSesion = await StorageService.getItem(
        StorageService.SESSION_REMEMBER_KEY
      );
      if (recordarSesion === "false") return null;

      // Intentar obtener sesión de Supabase (que usa AsyncStorage)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Hay sesión válida, obtener datos completos
        return await this.obtenerUsuarioActual();
      }

      // No hay sesión válida, limpiar datos locales
      await StorageService.limpiarDatosSesion();
      return null;
    } catch (error) {
      console.log("Error al verificar sesión persistente:", error);
      return null;
    }
  }

  /**
   * Escuchar cambios de autenticación
   * (Usado por el AuthProvider para reaccionar a logins/logouts)
   *
   * @param callback - Función que se ejecuta con el nuevo estado
   * @returns Suscripción para limpieza
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      // Lógica súper simplificada gracias al trigger
      if (session?.user) {
        // Si hay sesión, obtenemos el usuario completo
        const usuario = await this.obtenerUsuarioActual();
        callback(usuario);
      } else {
        // No hay sesión, devolvemos null
        callback(null);
      }
    });
  }
}

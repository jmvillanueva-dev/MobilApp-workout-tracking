import { SupabaseClient } from "@supabase/supabase-js";
import { User, UserRole } from "../../domain/models/User";
import {
  AuthResult,
  IAuthRepository,
} from "../../domain/repositories/IAuthRepository";

/**
 * Implementación del repositorio de autenticación usando Supabase
 *
 * - El registro es un proceso de 2 pasos:
 * 1. signUp en 'auth.users' (sin metadata).
 * 2. insert en 'public.profiles' con los datos del perfil.
 */
export class SupabaseAuthRepository implements IAuthRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  async signUp(
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ): Promise<AuthResult> {
    console.log("🔵 Iniciando signUp en Supabase (Método Cliente)...");

    try {
      // PASO 1: Crear el usuario en auth.users (SIN METADATA)
      const { data: authData, error: authError } =
        await this.supabaseClient.auth.signUp({
          email,
          password,
          // Eliminamos 'options.data' porque el trigger ya no existe
        });

      console.log("📊 Respuesta de auth.signUp:", {
        data: !!authData,
        error: authError,
      });

      if (authError) {
        console.error("❌ Error en auth.signUp:", authError);
        throw authError;
      }
      if (!authData.user)
        throw new Error("Registro fallido. No se pudo crear el usuario.");

      // PASO 2: Insertar el perfil manualmente en 'public.profiles'
      // Esto funcionará gracias a la política RLS "Allow individual insert"
      console.log("👤 Creando perfil para el usuario:", authData.user.id);
      const { error: profileError } = await this.supabaseClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role: role,
          avatar_url: null, // Puedes omitirlo si tu DB tiene un default
        });

      if (profileError) {
        console.error(
          "❌ ¡Error CRÍTICO! El usuario de Auth fue creado, pero la inserción del perfil falló.",
          profileError
        );
        // En un escenario real, aquí podrías registrar este error
        // para un proceso de limpieza (eliminar usuario huérfano).
        throw new Error(
          `El usuario de Auth se creó, pero el perfil falló: ${profileError.message}`
        );
      }

      console.log("✅ Perfil creado exitosamente.");

      // PASO 3: Verificar si necesita confirmación por email
      if (authData.user && !authData.session) {
        return {
          success: true,
          user: authData.user,
          needsConfirmation: true,
          message: "Revisa tu email para confirmar la cuenta",
        };
      }

      return { success: true, user: authData.user, session: authData.session };
    } catch (error: any) {
      console.error("Error en signUp:", error);

      let errorMessage =
        error.message || "Error desconocido durante el registro";
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email ya está registrado.";
      } else if (error.message.includes("profiles_pkey")) {
        // Error de Primary Key (perfil ya existe)
        errorMessage = "El perfil para este usuario ya existe.";
      } else if (error.message.includes("check constraint")) {
        // Error de RLS
        errorMessage =
          "No tienes permiso para crear este perfil. (Error de RLS)";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // ... (El resto de las funciones: signIn, signOut, getCurrentUser, etc.
  //      son correctas y no necesitan cambios)

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (error) throw error;
      if (!data.user) throw new Error("Inicio de sesión fallido");

      // Importante: Después de signIn, obtener el perfil completo
      const fullUser = await this.getCurrentUser();
      if (!fullUser) {
        throw new Error("Usuario autenticado pero no se encontró el perfil.");
      }

      return { success: true, user: fullUser, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabaseClient.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // PASO 1: Obtener usuario de Auth
      const {
        data: { user: authUser },
      } = await this.supabaseClient.auth.getUser();

      if (!authUser) return null;

      // PASO 2: Obtener información de la tabla 'profiles'
      const { data: profileData, error } = await this.supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error al obtener perfil:", error);
        // Si el error es "No rows found", es un usuario huérfano
        if (error.code === "PGRST116") {
          console.warn(
            "Usuario de Auth existe pero no se encontró perfil (PGRST116)."
          );
          throw new Error("No se encontró el perfil del usuario.");
        }
        throw error;
      }
      if (!profileData) {
        console.warn("Usuario de Auth existe pero no se encontró perfil.");
        throw new Error("No se encontró el perfil del usuario.");
      }

      // PASO 3: Combinar datos en nuestro modelo 'User'
      const fullUser: User = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        role: profileData.role,
        full_name: profileData.full_name,
        // Asumiendo que avatar_url está en el modelo User
        // avatar_url: profileData.avatar_url,
      };

      return fullUser;
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  }

  async getSession(): Promise<{ user: any; session: any } | null> {
    const {
      data: { session },
    } = await this.supabaseClient.auth.getSession();

    if (session?.user) {
      return { user: session.user, session };
    }
    return null;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth State Change Event:", event);
        if (event === "SIGNED_IN" && session?.user) {
          // Es crucial obtener el perfil completo de 'profiles'
          const usuario = await this.getCurrentUser();
          callback(usuario);
        } else if (event === "SIGNED_OUT") {
          callback(null);
        } else if (event === "INITIAL_SESSION" && session?.user) {
          const usuario = await this.getCurrentUser();
          callback(usuario);
        } else if (event === "USER_UPDATED" && session?.user) {
          const usuario = await this.getCurrentUser();
          callback(usuario);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          // No es necesario llamar a getCurrentUser aquí, la sesión
          // de usuario (id, email) no ha cambiado.
        }
      }
    );
  }
}

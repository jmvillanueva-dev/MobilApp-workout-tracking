import { User, UserRole } from "../models/User";

/**
 * Resultado de operaciones de autenticación
 */
export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  message?: string;
  needsConfirmation?: boolean;
}

/**
 * Interfaz del repositorio de autenticación
 * Define las operaciones abstractas de autenticación
 * independientes de la implementación específica (Supabase, Firebase, etc.)
 */
export interface IAuthRepository {
  /**
   * Registrar nuevo usuario
   */
  signUp(
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ): Promise<AuthResult>;

  /**
   * Iniciar sesión
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Cerrar sesión
   */
  signOut(): Promise<AuthResult>;

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Verificar sesión activa
   */
  getSession(): Promise<{ user: any; session: any } | null>;

  /**
   * Suscribirse a cambios de autenticación
   */
  onAuthStateChange(callback: (user: User | null) => void): {
    data: { subscription: { unsubscribe: () => void } };
  };
}

/**
 * Define los roles de usuario permitidos en la aplicación.
 */
export type UserRole = "usuario" | "entrenador";

/**
 * Interfaz User (Entidad de Dominio)
 *
 * Representa al usuario autenticado en nuestra aplicación.
 * Combina datos de `auth.users` (email, id) y
 * la tabla `profiles` (role, full_name).
 */
export interface User {
  id: string; // auth.users.id
  email?: string; // auth.users.email
  role: UserRole; // profiles.role
  full_name: string | null; // profiles.full_name
  avatar_url: string | null;
  created_at: string; // auth.users.created_at
}

// Interfaz para la tabla 'profiles' de usuarios
export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
}

/**
 * Datos para actualizar el perfil.
 */
export interface ProfileUpdateData {
  full_name?: string;
  avatarUri?: string; // URI local de la imagen
}


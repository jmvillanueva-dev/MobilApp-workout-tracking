// Exportaciones centralizadas de hooks de presentación
export { useAuth } from "../contexts/AuthProvider";
export { useProfile } from "./useProfile";

// Re-exportar tipos importantes
export type {
  ProfileUpdateData,
  User,
  UserRole,
} from "../../domain/models/User";

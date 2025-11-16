// Exportaciones centralizadas de hooks de presentación
export { useAuth } from "../contexts/AuthProvider";
export { useExercises } from "./useExercises";
export { useProfile } from "./useProfile";
export { useRoutines } from "./useRoutines";
export { useTrainingPlans } from "./useTrainingPlans";

// Re-exportar tipos importantes
export type {
  ProfileUpdateData,
  User,
  UserRole,
} from "../../domain/models/User";

// Exportaciones centralizadas de hooks de presentación
export { useAuth } from "../contexts/AuthProvider";
export { useProfile } from "./useProfile";

// Hooks específicos de funcionalidad
export { useChat } from "./useChat";
export { useExercises } from "./useExercises";
export { useProgressPhotos } from "./useProgressPhotos";
export { useRoutines } from "./useRoutines";
export { useSimpleProgressPhotos } from "./useSimpleProgressPhotos";
export { useSimpleWorkoutLogs } from "./useSimpleWorkoutLogs";
export { useTrainingPlans } from "./useTrainingPlans";
export { useUserPlans } from "./useUserPlans";
export { useUserRoutines } from "./useUserRoutines";
export { useWorkoutLogs } from "./useWorkoutLogs";

// Re-exportar tipos importantes
export type {
  ProfileUpdateData,
  User,
  UserRole,
} from "../../domain/models/User";

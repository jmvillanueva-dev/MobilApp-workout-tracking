import React, { createContext, ReactNode, useContext } from "react";
import { AsyncStorageRepository } from "../../data/repositories/AsyncStorageRepository";
import { SupabaseAuthRepository } from "../../data/repositories/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "../../data/repositories/SupabaseExerciseRepository";
import { SupabaseFileRepository } from "../../data/repositories/SupabaseFileRepository";
import { SupabaseProfileRepository } from "../../data/repositories/SupabaseProfileRepository";
import { SupabaseProgressPhotoRepository } from "../../data/repositories/SupabaseProgressPhotoRepository";
import { SupabaseRoutineRepository } from "../../data/repositories/SupabaseRoutineRepository";
import { SupabaseTrainingPlanRepository } from "../../data/repositories/SupabaseTrainingPlanRepository";
import { SupabaseUserRoutineRepository } from "../../data/repositories/SupabaseUserRoutineRepository";
import { SupabaseWorkoutLogRepository } from "../../data/repositories/SupabaseWorkoutLogRepository";
import { supabase } from "../../data/services/supabaseClient";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { IProgressPhotoRepository } from "../../domain/repositories/IProgressPhotoRepository";
import { IRoutineRepository } from "../../domain/repositories/IRoutineRepository";
import { IStorageRepository } from "../../domain/repositories/IStorageRepository";
import { ITrainingPlanRepository } from "../../domain/repositories/ITrainingPlanRepository";
import { IUserRoutineRepository } from "../../domain/repositories/IUserRoutineRepository";
import { IWorkoutLogRepository } from "../../domain/repositories/IWorkoutLogRepository";
import { AuthUseCase } from "../../domain/useCases/AuthUseCase";
import { ExerciseUseCase } from "../../domain/useCases/ExerciseUseCase";
import { MediaUseCase } from "../../domain/useCases/MediaUseCase";
import { ProfileUseCase } from "../../domain/useCases/ProfileUseCase";
import { ProgressPhotoUseCase } from "../../domain/useCases/ProgressPhotoUseCase";
import { RoutineUseCase } from "../../domain/useCases/RoutineUseCase";
import { TrainingPlanUseCase } from "../../domain/useCases/TrainingPlanUseCase";
import { UserRoutineUseCase } from "../../domain/useCases/UserRoutineUseCase";
import { WorkoutLogUseCase } from "../../domain/useCases/WorkoutLogUseCase";

/**
 * Dependencias inyectadas en la aplicación
 */
interface Dependencies {
  // Repositorios
  authRepository: IAuthRepository;
  storageRepository: IStorageRepository;
  profileRepository: IProfileRepository;
  fileRepository: IFileRepository;
  exerciseRepository: IExerciseRepository;
  routineRepository: IRoutineRepository;
  trainingPlanRepository: ITrainingPlanRepository;
  userRoutineRepository: IUserRoutineRepository;
  workoutLogRepository: IWorkoutLogRepository;
  progressPhotoRepository: IProgressPhotoRepository;

  // Casos de uso
  authUseCase: AuthUseCase;
  profileUseCase: ProfileUseCase;
  mediaUseCase: MediaUseCase;
  exerciseUseCase: ExerciseUseCase;
  routineUseCase: RoutineUseCase;
  trainingPlanUseCase: TrainingPlanUseCase;
  userRoutineUseCase: UserRoutineUseCase;
  workoutLogUseCase: WorkoutLogUseCase;
  progressPhotoUseCase: ProgressPhotoUseCase;
}

/**
 * Context de dependencias
 */
const DependencyContext = createContext<Dependencies | undefined>(undefined);

/**
 * Hook para obtener las dependencias
 */
export const useDependencies = (): Dependencies => {
  const context = useContext(DependencyContext);
  if (context === undefined) {
    throw new Error(
      "useDependencies debe ser usado dentro de DependencyProvider"
    );
  }
  return context;
};

/**
 * Provider de dependencias - Implementa Dependency Injection
 *
 * Este componente centraliza la creación e inyección de dependencias,
 * siguiendo los principios de Clean Architecture y SOLID.
 */
export const DependencyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Crear repositorios
  const authRepository = new SupabaseAuthRepository(supabase);
  const storageRepository = new AsyncStorageRepository();
  const profileRepository = new SupabaseProfileRepository(supabase);
  const fileRepository = new SupabaseFileRepository(supabase);
  const exerciseRepository = new SupabaseExerciseRepository();
  const routineRepository = new SupabaseRoutineRepository();
  const trainingPlanRepository = new SupabaseTrainingPlanRepository();
  const userRoutineRepository = new SupabaseUserRoutineRepository();
  const workoutLogRepository = new SupabaseWorkoutLogRepository();
  const progressPhotoRepository = new SupabaseProgressPhotoRepository();

  // Crear casos de uso con dependency injection
  const authUseCase = new AuthUseCase(authRepository, storageRepository);
  const profileUseCase = new ProfileUseCase(
    profileRepository,
    fileRepository,
    authRepository
  );
  const mediaUseCase = new MediaUseCase(); // TODO: Refactorizar también
  const exerciseUseCase = new ExerciseUseCase(
    exerciseRepository,
    fileRepository
  );
  const routineUseCase = new RoutineUseCase(routineRepository);
  const trainingPlanUseCase = new TrainingPlanUseCase(trainingPlanRepository);
  const userRoutineUseCase = new UserRoutineUseCase(userRoutineRepository);
  const workoutLogUseCase = new WorkoutLogUseCase(workoutLogRepository);
  const progressPhotoUseCase = new ProgressPhotoUseCase(
    progressPhotoRepository
  );

  const dependencies: Dependencies = {
    // Repositorios
    authRepository,
    storageRepository,
    profileRepository,
    fileRepository,
    exerciseRepository,
    routineRepository,
    trainingPlanRepository,
    userRoutineRepository,
    workoutLogRepository,
    progressPhotoRepository,

    // Casos de uso
    authUseCase,
    profileUseCase,
    mediaUseCase,
    exerciseUseCase,
    routineUseCase,
    trainingPlanUseCase,
    userRoutineUseCase,
    workoutLogUseCase,
    progressPhotoUseCase,
  };

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

import React, { createContext, ReactNode, useContext } from "react";
import { AsyncStorageRepository } from "../../data/repositories/AsyncStorageRepository";
import { SupabaseAuthRepository } from "../../data/repositories/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "../../data/repositories/SupabaseExerciseRepository";
import { SupabaseFileRepository } from "../../data/repositories/SupabaseFileRepository";
import { SupabaseProfileRepository } from "../../data/repositories/SupabaseProfileRepository";
import { SupabaseRoutineRepository } from "../../data/repositories/SupabaseRoutineRepository";
import { SupabaseTrainingPlanRepository } from "../../data/repositories/SupabaseTrainingPlanRepository";
import { supabase } from "../../data/services/supabaseClient";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { IRoutineRepository } from "../../domain/repositories/IRoutineRepository";
import { IStorageRepository } from "../../domain/repositories/IStorageRepository";
import { ITrainingPlanRepository } from "../../domain/repositories/ITrainingPlanRepository";
import { AuthUseCase } from "../../domain/useCases/AuthUseCase";
import { ExerciseUseCase } from "../../domain/useCases/ExerciseUseCase";
import { MediaUseCase } from "../../domain/useCases/MediaUseCase";
import { ProfileUseCase } from "../../domain/useCases/ProfileUseCase";
import { RoutineUseCase } from "../../domain/useCases/RoutineUseCase";
import { TrainingPlanUseCase } from "../../domain/useCases/TrainingPlanUseCase";

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

  // Casos de uso
  authUseCase: AuthUseCase;
  profileUseCase: ProfileUseCase;
  mediaUseCase: MediaUseCase;
  exerciseUseCase: ExerciseUseCase;
  routineUseCase: RoutineUseCase;
  trainingPlanUseCase: TrainingPlanUseCase;
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

  const dependencies: Dependencies = {
    // Repositorios
    authRepository,
    storageRepository,
    profileRepository,
    fileRepository,
    exerciseRepository,
    routineRepository,
    trainingPlanRepository,

    // Casos de uso
    authUseCase,
    profileUseCase,
    mediaUseCase,
    exerciseUseCase,
    routineUseCase,
    trainingPlanUseCase,
  };

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

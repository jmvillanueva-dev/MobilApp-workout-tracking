import React, { createContext, ReactNode, useContext } from "react";
import { AsyncStorageRepository } from "../../data/repositories/AsyncStorageRepository";
import { SupabaseAuthRepository } from "../../data/repositories/SupabaseAuthRepository";
import { SupabaseFileRepository } from "../../data/repositories/SupabaseFileRepository";
import { SupabaseProfileRepository } from "../../data/repositories/SupabaseProfileRepository";
import { supabase } from "../../data/services/supabaseClient";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { IStorageRepository } from "../../domain/repositories/IStorageRepository";
import { AuthUseCase } from "../../domain/useCases/AuthUseCase";
import { MediaUseCase } from "../../domain/useCases/MediaUseCase";
import { ProfileUseCase } from "../../domain/useCases/ProfileUseCase";

/**
 * Dependencias inyectadas en la aplicación
 */
interface Dependencies {
  authRepository: IAuthRepository;
  storageRepository: IStorageRepository;
  profileRepository: IProfileRepository;
  fileRepository: IFileRepository;
  authUseCase: AuthUseCase;
  profileUseCase: ProfileUseCase;
  mediaUseCase: MediaUseCase;
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

  // Crear casos de uso con dependency injection
  const authUseCase = new AuthUseCase(authRepository, storageRepository);
  const profileUseCase = new ProfileUseCase(
    profileRepository,
    fileRepository,
    authRepository
  );
  const mediaUseCase = new MediaUseCase(); // TODO: Refactorizar también

  const dependencies: Dependencies = {
    authRepository,
    storageRepository,
    profileRepository,
    fileRepository,
    authUseCase,
    profileUseCase,
    mediaUseCase,
  };

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

import { CreateExerciseRequest, UpdateExerciseRequest } from "../models";
import { IExerciseRepository } from "../repositories/IExerciseRepository";
import { IFileRepository } from "../repositories/IFileRepository";

/**
 * ExerciseUseCase - Caso de uso para gestión de ejercicios
 *
 * Contiene toda la lógica de negocio relacionada con ejercicios,
 * siguiendo los principios de Clean Architecture.
 */
export class ExerciseUseCase {
  constructor(
    private exerciseRepository: IExerciseRepository,
    private fileRepository: IFileRepository
  ) {}

  /**
   * Obtener todos los ejercicios disponibles
   */
  async obtenerTodos() {
    try {
      console.log("🏋️ ExerciseUseCase - Obteniendo todos los ejercicios");
      return await this.exerciseRepository.obtenerTodos();
    } catch (error: any) {
      console.error("❌ Error en obtenerTodos:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener ejercicios creados por el entrenador actual
   */
  async obtenerMisEjercicios() {
    try {
      console.log("🏋️ ExerciseUseCase - Obteniendo mis ejercicios");
      // El repositorio obtendrá automáticamente el usuario actual
      // Por ahora retornamos todos, pero podríamos filtrar por entrenador
      return await this.exerciseRepository.obtenerTodos();
    } catch (error: any) {
      console.error("❌ Error en obtenerMisEjercicios:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener un ejercicio específico por ID
   */
  async obtenerPorId(id: number) {
    try {
      console.log("🏋️ ExerciseUseCase - Obteniendo ejercicio:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de ejercicio inválido" };
      }

      return await this.exerciseRepository.obtenerPorId(id);
    } catch (error: any) {
      console.error("❌ Error en obtenerPorId:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear un nuevo ejercicio
   */
  async crear(ejercicio: CreateExerciseRequest) {
    try {
      console.log("🏋️ ExerciseUseCase - Creando ejercicio:", ejercicio.name);

      // Validaciones de negocio
      if (!ejercicio.name || ejercicio.name.trim().length < 2) {
        return {
          success: false,
          error: "El nombre del ejercicio debe tener al menos 2 caracteres",
        };
      }

      if (ejercicio.name.trim().length > 100) {
        return {
          success: false,
          error: "El nombre del ejercicio no puede exceder 100 caracteres",
        };
      }

      if (ejercicio.description && ejercicio.description.length > 500) {
        return {
          success: false,
          error: "La descripción no puede exceder 500 caracteres",
        };
      }

      // Crear el ejercicio
      const ejercicioData: CreateExerciseRequest = {
        name: ejercicio.name.trim(),
        description: ejercicio.description?.trim(),
        videoUrl: ejercicio.videoUrl,
      };

      return await this.exerciseRepository.crear(ejercicioData);
    } catch (error: any) {
      console.error("❌ Error en crear ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear ejercicio con video
   */
  async crearConVideo(ejercicio: CreateExerciseRequest, videoUri?: string) {
    try {
      console.log("🏋️ ExerciseUseCase - Creando ejercicio con video");

      let videoUrl: string | undefined;

      // Subir video si se proporciona
      if (videoUri) {
        console.log("📹 Subiendo video del ejercicio...");
        const videoResult = await this.fileRepository.subirVideo(
          videoUri,
          `ejercicio-${Date.now()}`
        );

        if (!videoResult.success) {
          return {
            success: false,
            error: `Error subiendo video: ${videoResult.error}`,
          };
        }

        videoUrl = videoResult.data;
      }

      // Crear ejercicio con URL del video
      const ejercicioConVideo: CreateExerciseRequest = {
        ...ejercicio,
        videoUrl,
      };

      return await this.crear(ejercicioConVideo);
    } catch (error: any) {
      console.error("❌ Error en crearConVideo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Actualizar un ejercicio existente
   */
  async actualizar(id: number, ejercicio: UpdateExerciseRequest) {
    try {
      console.log("🏋️ ExerciseUseCase - Actualizando ejercicio:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de ejercicio inválido" };
      }

      // Validaciones de negocio
      if (ejercicio.name !== undefined) {
        if (!ejercicio.name || ejercicio.name.trim().length < 2) {
          return {
            success: false,
            error: "El nombre del ejercicio debe tener al menos 2 caracteres",
          };
        }
        if (ejercicio.name.trim().length > 100) {
          return {
            success: false,
            error: "El nombre del ejercicio no puede exceder 100 caracteres",
          };
        }
      }

      if (
        ejercicio.description !== undefined &&
        ejercicio.description &&
        ejercicio.description.length > 500
      ) {
        return {
          success: false,
          error: "La descripción no puede exceder 500 caracteres",
        };
      }

      const ejercicioData: UpdateExerciseRequest = {
        name: ejercicio.name?.trim(),
        description: ejercicio.description?.trim(),
        videoUrl: ejercicio.videoUrl,
      };

      return await this.exerciseRepository.actualizar(id, ejercicioData);
    } catch (error: any) {
      console.error("❌ Error en actualizar ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Eliminar un ejercicio
   */
  async eliminar(id: number) {
    try {
      console.log("🏋️ ExerciseUseCase - Eliminando ejercicio:", id);

      if (!id || id <= 0) {
        return { success: false, error: "ID de ejercicio inválido" };
      }

      return await this.exerciseRepository.eliminar(id);
    } catch (error: any) {
      console.error("❌ Error en eliminar ejercicio:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar ejercicios por nombre
   */
  async buscar(query: string) {
    try {
      console.log("🏋️ ExerciseUseCase - Buscando ejercicios:", query);

      if (!query || query.trim().length < 2) {
        return {
          success: false,
          error: "La búsqueda debe tener al menos 2 caracteres",
        };
      }

      return await this.exerciseRepository.buscarPorNombre(query.trim());
    } catch (error: any) {
      console.error("❌ Error en buscar ejercicios:", error);
      return { success: false, error: error.message };
    }
  }
}

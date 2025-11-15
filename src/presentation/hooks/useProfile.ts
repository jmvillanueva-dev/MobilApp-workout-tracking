import { useState } from "react";
import { ProfileUpdateData } from "../../domain/models/User";
import { useAuth } from "../contexts/AuthProvider";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * useProfile - Hook de gestión del perfil del usuario
 *
 * Proporciona funcionalidades para actualizar el perfil y manejar multimedia.
 * Se integra con el AuthContext para mantener la sincronización del estado del usuario.
 * Usa dependency injection para obtener los casos de uso.
 */
export function useProfile() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener dependencias inyectadas
  const { profileUseCase, mediaUseCase } = useDependencies();

  // Obtener funciones del contexto de autenticación
  const { recargarUsuario } = useAuth();

  /**
   * Actualizar el perfil del usuario
   */
  const actualizarPerfil = async (updates: ProfileUpdateData) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await profileUseCase.actualizarMiPerfil(updates);

      if (resultado.success) {
        // Recargar el usuario en el contexto global
        await recargarUsuario();
        return resultado;
      } else {
        throw new Error(resultado.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Error al actualizar perfil";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCargando(false);
    }
  };

  /**
   * Seleccionar avatar desde la galería
   */
  const seleccionarAvatarGaleria = async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await mediaUseCase.seleccionarAvatarGaleria();
      if (!resultado.success) {
        if (resultado.error !== "canceled") {
          throw new Error(resultado.message || "Error al seleccionar imagen");
        }
      }
      return resultado;
    } catch (error: any) {
      const errorMessage = error.message || "Error al seleccionar imagen";
      setError(errorMessage);
      return {
        success: false,
        asset: null,
        error: "unknown",
        message: errorMessage,
      };
    } finally {
      setCargando(false);
    }
  };

  /**
   * Tomar foto para avatar
   */
  const tomarFotoAvatar = async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await mediaUseCase.tomarFotoAvatar();
      if (!resultado.success) {
        if (resultado.error !== "canceled") {
          throw new Error(resultado.message || "Error al tomar foto");
        }
      }
      return resultado;
    } catch (error: any) {
      const errorMessage = error.message || "Error al tomar foto";
      setError(errorMessage);
      return {
        success: false,
        asset: null,
        error: "unknown",
        message: errorMessage,
      };
    } finally {
      setCargando(false);
    }
  };

  /**
   * Limpiar mensaje de error
   */
  const limpiarError = () => {
    setError(null);
  };

  return {
    cargando,
    error,
    actualizarPerfil,
    seleccionarAvatarGaleria,
    tomarFotoAvatar,
    limpiarError,
  };
}

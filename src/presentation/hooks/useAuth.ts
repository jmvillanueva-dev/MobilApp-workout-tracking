import { useEffect, useState } from "react";
import { User, UserRole } from "../../domain/models/User";
import { useDependencies } from "../providers/DependencyProvider";

/**
 * useAuthLogic - Hook de lógica de autenticación
 *
 * Este hook pertenece a la capa de presentación y se encarga de:
 * - Manejar el estado reactivo de la autenticación
 * - Usar dependency injection para obtener los casos de uso
 * - Delegar toda la lógica de negocio a los casos de uso del dominio
 * - Mantener separación clara entre capas
 */
export function useAuthLogic() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  console.log("🔵 useAuthLogic - Iniciando hook");

  // Usar dependency injection para obtener los casos de uso
  const { authUseCase, storageRepository } = useDependencies();
  console.log("✅ useAuthLogic - Dependencies obtenidas");

  useEffect(() => {
    console.log("🔵 useAuthLogic - useEffect iniciado");

    // Función para verificar sesión inicial
    const verificarSesion = async () => {
      try {
        console.log("🔍 Verificando sesión persistente...");
        const usuarioPersistente =
          await authUseCase.verificarSesionPersistente();
        console.log("📊 Usuario persistente:", !!usuarioPersistente);
        setUsuario(usuarioPersistente);
      } catch (error) {
        console.error("❌ Error al verificar sesión inicial:", error);
        setUsuario(null);
      } finally {
        console.log("✅ setCargando(false) - Terminando carga");
        setCargando(false);
      }
    };

    // AL MONTAR: Verificar si hay sesión persistente
    verificarSesion();

    // SUSCRIBIRSE: Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange(
      async (user) => {
        setUsuario(user);
        setCargando(false);

        // Si hay usuario activo, guardar en storage para persistencia
        if (user) {
          const recordarSesion = await storageRepository.getItem(
            "wtapp_remember_session"
          );
          if (recordarSesion !== "false") {
            await storageRepository.setObject("wtapp_current_user", user);
          }
        }
      }
    );

    // LIMPIAR: Cancelar suscripción al desmontar
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [authUseCase, storageRepository]);

  /**
   * Registrar nuevo usuario
   */
  const registrar = async (
    email: string,
    password: string,
    rol: UserRole,
    fullName: string
  ) => {
    return await authUseCase.registrar(email, password, rol, fullName);
  };

  /**
   * Iniciar sesión
   */
  const iniciarSesion = async (
    email: string,
    password: string,
    recordarSesion: boolean = true
  ) => {
    return await authUseCase.iniciarSesion(email, password, recordarSesion);
  };

  /**
   * Cerrar sesión
   */
  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  /**
   * Recargar manualmente los datos del usuario
   */
  const recargarUsuario = async () => {
    try {
      const usuarioActualizado = await authUseCase.obtenerUsuarioActual();
      setUsuario(usuarioActualizado);
    } catch (error) {
      console.error("Error al recargar usuario:", error);
    }
  };

  return {
    usuario,
    cargando,
    registrar,
    iniciarSesion,
    cerrarSesion,
    recargarUsuario,
    esEntrenador: usuario?.role === "entrenador",
    esUsuario: usuario?.role === "usuario",
  };
}

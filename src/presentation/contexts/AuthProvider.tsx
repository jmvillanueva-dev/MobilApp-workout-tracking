import React, { createContext, useContext } from "react";
import { User, UserRole } from "../../domain/models/User";
import { useAuthLogic } from "../../presentation/hooks/useAuth";

/**
 * Define la forma de los datos que nuestro contexto
 * de autenticación va a proveer.
 */
interface AuthContextData {
  usuario: User | null;
  cargando: boolean;
  registrar: (
    email: string,
    password: string,
    rol: UserRole,
    fullName: string
  ) => Promise<any>;
  iniciarSesion: (
    email: string,
    password: string,
    recordarSesion?: boolean
  ) => Promise<any>;
  cerrarSesion: () => Promise<any>;
  recargarUsuario: () => Promise<void>;
  esEntrenador: boolean;
  esUsuario: boolean;
}

/**
 * Creamos el Contexto de React.
 * Le damos un valor por defecto (para cuando se usa fuera del provider).
 */
const AuthContext = createContext<AuthContextData>({
  usuario: null,
  cargando: true,
  registrar: async () => {},
  iniciarSesion: async () => {},
  cerrarSesion: async () => {},
  recargarUsuario: async () => {},
  esEntrenador: false,
  esUsuario: false,
});

/**
 * (Hook de Consumo)
 * Este es el hook que nuestras pantallas usarán para
 * acceder a los datos de autenticación.
 * Ej: const { usuario, iniciarSesion } = useAuth();
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * (Componente Proveedor)
 * Este es el componente que envuelve nuestra aplicación.
 * Utiliza el hook 'useAuthLogic' para obtener el estado y
 * lo provee a todos sus componentes hijos.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log("🔵 AuthProvider - Renderizando...");

  try {
    // 1. Usamos el hook de lógica que definimos
    const authLogic = useAuthLogic();
    console.log("✅ AuthProvider - authLogic obtenido:", {
      cargando: authLogic.cargando,
      tieneUsuario: !!authLogic.usuario,
    });

    // 2. Pasamos el valor de ese hook al Provider
    return (
      <AuthContext.Provider value={authLogic}>{children}</AuthContext.Provider>
    );
  } catch (error) {
    console.error("❌ Error en AuthProvider:", error);

    // Fallback en caso de error
    const fallbackValue: AuthContextData = {
      usuario: null,
      cargando: false,
      registrar: async () => ({ success: false, error: "Provider error" }),
      iniciarSesion: async () => ({ success: false, error: "Provider error" }),
      cerrarSesion: async () => ({ success: false, error: "Provider error" }),
      recargarUsuario: async () => {},
      esEntrenador: false,
      esUsuario: false,
    };

    return (
      <AuthContext.Provider value={fallbackValue}>
        {children}
      </AuthContext.Provider>
    );
  }
};

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
  registrar: (email: string, password: string, rol: UserRole, fullName: string) => Promise<any>;
  iniciarSesion: (
    email: string,
    password: string,
    recordarSesion?: boolean
  ) => Promise<any>;
  cerrarSesion: () => Promise<any>;
  recargarUsuario: () => Promise<void>; // <-- Nuevo
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
  recargarUsuario: async () => {}, // <-- Nuevo
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
  // 1. Usamos el hook de lógica que definimos
  const authLogic = useAuthLogic();

  // 2. Pasamos el valor de ese hook al Provider
  return (
    <AuthContext.Provider value={authLogic}>{children}</AuthContext.Provider>
  );
};

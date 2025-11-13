import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  PropsWithChildren,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../data/services/supabaseClient";

/**
 * Define la forma (shape) de nuestro contexto de autenticación.
 * Esto es lo que los componentes "consumirán"
 */
type AuthContextType = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

/**
 * Creación del Contexto de Autenticación.
 * Le damos un valor inicial `undefined` y lo manejaremos
 * con un hook personalizado para evitar errores.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Este es el componente Proveedor.
 * Envolverá nuestra aplicación y proporcionará el contexto de autenticación.
 */
export const AuthProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Marcar que estamos cargando
    setIsLoading(true);

    // 2. Intentar obtener la sesión activa al cargar la app.
    // Esto es crucial para restaurar la sesión persistente.
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // 3. Escuchar cambios en el estado de autenticación (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Cada vez que hay un evento (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
        // actualizamos el estado de la sesión.
        setSession(session);

        // Si fetchSession() todavía estaba corriendo,
        // esto asegura que paremos de cargar.
        if (isLoading) {
          setIsLoading(false);
        }
      }
    );

    // 4. Limpiar el listener cuando el componente se desmonte
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez al montar

  // 5. Crear el valor a proveer a los componentes hijos
  const value = {
    isLoading,
    session,
    user: session?.user ?? null, // Extraemos el 'user' de la sesión para fácil acceso
  };

  // 6. Proveer el contexto a los hijos
  //    No renderizamos nada hasta que la carga inicial esté completa
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para consumir el AuthContext.
 * Esto proporciona una forma limpia y segura de acceder al contexto.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
};

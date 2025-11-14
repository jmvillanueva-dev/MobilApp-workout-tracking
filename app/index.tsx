import React from "react";
import { AuthRedirect, LoadingScreen } from "../src/presentation/components";
import { useAuth } from "../src/presentation/contexts/AuthProvider";

/**
 * Index Screen - Pantalla de entrada de la aplicación
 *
 * Esta pantalla:
 * - Muestra un loading mientras verifica el estado de autenticación
 * - Redirige automáticamente según el estado del usuario
 * - Actúa como punto de entrada único de la aplicación
 */
export default function IndexScreen() {
  console.log("🟡 IndexScreen - Componente iniciado");

  const { cargando, usuario } = useAuth();

  console.log("🔵 IndexScreen - Estado obtenido:", {
    cargando,
    usuario: !!usuario,
  });

  if (cargando) {
    console.log("⏳ IndexScreen - Renderizando LoadingScreen");
    return <LoadingScreen message="Verificando sesión..." />;
  }

  console.log("🔵 IndexScreen - Renderizando AuthRedirect");
  return <AuthRedirect />;
}

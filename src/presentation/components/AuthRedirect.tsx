import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { DebugScreen } from "./DebugScreen";

/**
 * AuthRedirect - Componente para redirección automática basada en autenticación
 *
 * Este componente se encarga de:
 * - Redirigir usuarios autenticados a la pantalla principal
 * - Redirigir usuarios no autenticados a login
 * - Manejar el estado de carga
 */
export function AuthRedirect() {
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    console.log("🔵 AuthRedirect - Estado:", { cargando, usuario: !!usuario });

    if (!cargando) {
      console.log("🔵 AuthRedirect - Procesando redirección...");

      if (usuario) {
        console.log("✅ Usuario autenticado, redirigiendo a /(tabs)");
        router.replace("/(tabs)");
      } else {
        console.log("❌ Usuario NO autenticado, redirigiendo a /auth/login");
        router.replace("/auth/login");
      }
    } else {
      console.log("⏳ AuthRedirect - Aún cargando...");
    }
  }, [usuario, cargando]);

  // TEMPORAL: Mostrar debug screen para diagnosticar
  console.log("🔵 AuthRedirect renderizando - Estado actual:", {
    cargando,
    usuario: !!usuario,
  });

  return <DebugScreen />;
}

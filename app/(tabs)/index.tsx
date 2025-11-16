import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen, QuickStats } from "../../src/presentation/components";
import {
  useAuth,
  useExercises,
  useRoutines,
  useTrainingPlans,
} from "../../src/presentation/hooks";

/**
 * Pantalla Principal - Dashboard del usuario
 */
export default function HomeScreen() {
  const { usuario, cargando, cerrarSesion } = useAuth();
  const {
    trainingPlans,
    loading: plansLoading,
    refreshPlans,
  } = useTrainingPlans();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { routines, loading: routinesLoading } = useRoutines();

  const [refreshing, setRefreshing] = useState(false);

  const esEntrenador = usuario?.role === "entrenador";

  /**
   * Navegar al perfil del usuario
   */
  const irAPerfil = () => {
    router.push("/(tabs)/profile");
  };

  /**
   * Manejar cierre de sesión
   */
  const handleCerrarSesion = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              const resultado = await cerrarSesion();
              if (!resultado.success) {
                Alert.alert("Error", "No se pudo cerrar la sesión");
              }
            } catch {
              Alert.alert("Error", "No se pudo cerrar la sesión");
            }
          },
        },
      ]
    );
  };

  /**
   * Refrescar datos
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPlans();
    setRefreshing(false);
  };

  /**
   * Navegaciones rápidas
   */
  const handleCreateExercise = () => {
    router.push("/trainer/crear-ejercicio");
  };

  const handleCreateRoutine = () => {
    router.push("/trainer/crear-rutina");
  };

  const handleViewExercises = () => {
    router.push("/(tabs)/explore");
  };

  const handleCreatePlan = () => {
    router.push("/trainer/crear-plan");
  };

  if (cargando) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  if (!usuario) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={irAPerfil}>
            <Image
              source={{
                uri: usuario.avatar_url
                  ? usuario.avatar_url
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      usuario.full_name || usuario.email?.charAt(0) || "U"
                    )}&size=100&background=3b82f6&color=fff`,
              }}
              style={styles.headerAvatar}
            />
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>
                {usuario.full_name || usuario.email}
              </Text>
              <Text style={styles.userRole}>
                {esEntrenador ? "Entrenador" : "Usuario"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutIconButton}
            onPress={handleCerrarSesion}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcome}>
            ¡Hola, {usuario.full_name?.split(" ")[0] || "Usuario"}!
          </Text>
          <Text style={styles.subtitle}>
            {esEntrenador
              ? "Gestiona tus entrenamientos y planes"
              : "¿Listo para entrenar hoy?"}
          </Text>
        </View>

        {/* Dashboard específico según el rol */}
        {esEntrenador ? (
          <TrainerDashboard
            trainingPlans={trainingPlans}
            exercises={exercises}
            routines={routines}
            loading={plansLoading || exercisesLoading || routinesLoading}
            onCreateExercise={handleCreateExercise}
            onCreateRoutine={handleCreateRoutine}
            onCreatePlan={handleCreatePlan}
            onViewExercises={handleViewExercises}
          />
        ) : (
          <UserDashboard trainingPlans={trainingPlans} loading={plansLoading} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Dashboard para entrenadores
 */
function TrainerDashboard({
  trainingPlans,
  exercises,
  routines,
  loading,
  onCreateExercise,
  onCreateRoutine,
  onCreatePlan,
  onViewExercises,
}: {
  trainingPlans: any[];
  exercises: any[];
  routines: any[];
  loading: boolean;
  onCreateExercise: () => void;
  onCreateRoutine: () => void;
  onCreatePlan: () => void;
  onViewExercises: () => void;
}) {
  return (
    <View style={styles.dashboardContent}>
      {/* Estadísticas rápidas */}
      <QuickStats
        exerciseCount={exercises.length}
        routineCount={routines.length}
        planCount={trainingPlans.length}
        onPressExercises={onViewExercises}
        onPressRoutines={onViewExercises}
        onPressPlans={onViewExercises}
      />

      {/* Panel de gestión principal para entrenadores */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Panel de Gestión</Text>
        <View style={styles.trainerMenuContainer}>
          <TouchableOpacity
            style={[styles.trainerMenuCard, { borderLeftColor: "#4CAF50" }]}
            onPress={() => router.push("/trainer/mis-planes")}
          >
            <View style={styles.menuCardContent}>
              <View style={styles.menuCardHeader}>
                <Text style={styles.menuCardIcon}>📋</Text>
                <Text style={styles.menuCardTitle}>Ver Mis Planes</Text>
              </View>
              <Text style={styles.menuCardDescription}>
                Visualiza y gestiona los planes de entrenamiento creados
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.trainerMenuCard, { borderLeftColor: "#2196F3" }]}
            onPress={onCreatePlan}
          >
            <View style={styles.menuCardContent}>
              <View style={styles.menuCardHeader}>
                <Text style={styles.menuCardIcon}>➕</Text>
                <Text style={styles.menuCardTitle}>Crear Plan</Text>
              </View>
              <Text style={styles.menuCardDescription}>
                Crea un nuevo plan de entrenamiento para tus clientes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Acciones rápidas de creación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crear Contenido</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onCreateExercise}
          >
            <Ionicons name="add-circle" size={28} color="#9C27B0" />
            <Text style={styles.actionTitle}>Ejercicio</Text>
            <Text style={styles.actionSubtitle}>Con video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onCreateRoutine}>
            <Ionicons name="fitness" size={28} color="#FF9800" />
            <Text style={styles.actionTitle}>Rutina</Text>
            <Text style={styles.actionSubtitle}>Personalizada</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={onViewExercises}>
            <Ionicons name="library" size={28} color="#10b981" />
            <Text style={styles.actionTitle}>Explorar</Text>
            <Text style={styles.actionSubtitle}>Todo contenido</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Dashboard para usuarios regulares
 */
function UserDashboard({
  trainingPlans,
  loading,
}: {
  trainingPlans: any[];
  loading: boolean;
}) {
  return (
    <View style={styles.dashboardContent}>
      {/* Planes de entrenamiento asignados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Planes de Entrenamiento</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando planes...</Text>
          </View>
        ) : trainingPlans.length > 0 ? (
          <FlatList
            data={trainingPlans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planHeaderLeft}>
                    <Text style={styles.planIcon}>💪</Text>
                    <Text style={styles.planName}>{item.name}</Text>
                  </View>
                  <Text style={styles.planStatus}>Activo</Text>
                </View>
                {item.description && (
                  <Text style={styles.planDescription}>{item.description}</Text>
                )}
                <View style={styles.planInfo}>
                  <View style={styles.planInfoItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6b7280"
                    />
                    <Text style={styles.planInfoText}>
                      Inicio: {new Date(item.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {item.endDate && (
                    <View style={styles.planInfoItem}>
                      <Ionicons name="flag-outline" size={14} color="#6b7280" />
                      <Text style={styles.planInfoText}>
                        Fin: {new Date(item.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {item.trainer && (
                    <View style={styles.planInfoItem}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#6b7280"
                      />
                      <Text style={styles.planInfoText}>
                        Entrenador: {item.trainer.fullName}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🏋️‍♀️</Text>
            <Text style={styles.emptyStateTitle}>
              ¡Comienza tu Transformación!
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Aún no tienes planes asignados. Contacta a tu entrenador para
              comenzar tu journey fitness personalizado.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push("/(tabs)/chat")}
            >
              <Text style={styles.emptyStateButtonText}>
                Contactar Entrenador
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Acciones del usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explora y Entrena</Text>
        <View style={styles.trainerMenuContainer}>
          <TouchableOpacity
            style={[styles.trainerMenuCard, { borderLeftColor: "#10b981" }]}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <View style={styles.menuCardContent}>
              <View style={styles.menuCardHeader}>
                <Text style={styles.menuCardIcon}>🔍</Text>
                <Text style={styles.menuCardTitle}>Explorar Ejercicios</Text>
              </View>
              <Text style={styles.menuCardDescription}>
                Descubre ejercicios y rutinas disponibles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.trainerMenuCard, { borderLeftColor: "#3b82f6" }]}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <View style={styles.menuCardContent}>
              <View style={styles.menuCardHeader}>
                <Text style={styles.menuCardIcon}>💬</Text>
                <Text style={styles.menuCardTitle}>Chat con Entrenador</Text>
              </View>
              <Text style={styles.menuCardDescription}>
                Comunícate con tu entrenador personal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutIconButton: {
    padding: 8,
  },

  // Welcome section
  welcomeSection: {
    padding: 20,
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },

  // Dashboard content
  dashboardContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 3,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 2,
  },

  // Navigation card
  navigationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  navText: {
    marginLeft: 12,
    flex: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  navSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Plans (for users)
  planCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  planStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10b981",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },

  // Empty state
  emptyState: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 20,
  },

  // Trainer menu styles
  trainerMenuContainer: {
    gap: 12,
  },
  trainerMenuCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  menuCardContent: {
    flex: 1,
  },
  menuCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  menuCardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  menuCardDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },

  // Enhanced plan card styles
  planHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  planIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  planInfo: {
    marginTop: 12,
    gap: 6,
  },
  planInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  planInfoText: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Enhanced empty state
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

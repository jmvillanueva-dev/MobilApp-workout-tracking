import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../src/presentation/components";
import {
  useAuth,
  useExercises,
  useRoutines,
} from "../../src/presentation/hooks";

/**
 * Pantalla Explorar - Gestión de ejercicios y rutinas (Entrenadores) / Explorar contenido (Usuarios)
 */
export default function ExploreScreen() {
  const { usuario, cargando, esEntrenador } = useAuth();
  const [activeTab, setActiveTab] = useState<"exercises" | "routines">(
    "exercises"
  );

  if (cargando) {
    return <LoadingScreen message="Cargando..." />;
  }

  if (!usuario) {
    return null;
  }

  // Vista para usuarios normales
  if (!esEntrenador) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Rutinas</Text>
          <Text style={styles.subtitle}>
            Descubre nuevas rutinas y ejercicios
          </Text>
          <Text style={styles.placeholder}>
            Aquí podrás explorar:
            {"\n"}• Rutinas populares
            {"\n"}• Ejercicios recomendados
            {"\n"}• Entrenamientos destacados
            {"\n"}• Programas personalizados
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Vista para entrenadores
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Contenido</Text>
        <Text style={styles.subtitle}>Gestiona ejercicios y rutinas</Text>
      </View>

      {/* Tabs de navegación */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "exercises" && styles.activeTab]}
          onPress={() => setActiveTab("exercises")}
        >
          <Ionicons
            name="fitness"
            size={20}
            color={activeTab === "exercises" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "exercises" && styles.activeTabText,
            ]}
          >
            Ejercicios
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "routines" && styles.activeTab]}
          onPress={() => setActiveTab("routines")}
        >
          <Ionicons
            name="list"
            size={20}
            color={activeTab === "routines" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "routines" && styles.activeTabText,
            ]}
          >
            Rutinas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === "exercises" ? <ExercisesTab /> : <RoutinesTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Tab de Ejercicios para entrenadores
 */
function ExercisesTab() {
  const { exercises, loading, error, refreshExercises, deleteExercise } =
    useExercises();

  const handleCreateExercise = () => {
    router.push("/trainer/crear-ejercicio");
  };

  const handleDeleteExercise = (exerciseId: number, exerciseName: string) => {
    Alert.alert(
      "Eliminar Ejercicio",
      `¿Estás seguro que deseas eliminar "${exerciseName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteExercise(exerciseId);
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshExercises}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Header con botón de crear */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Ejercicios</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateExercise}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de ejercicios */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshExercises} />
        }
      >
        {exercises.length === 0 ? (
          <Text style={styles.placeholderText}>
            No tienes ejercicios creados aún.
            {"\n"}¡Crea tu primer ejercicio!
          </Text>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.cardContent}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>
                    {exercise.description || "Sin descripción"}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  {exercise.videoUrl && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="play-circle" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="create" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      handleDeleteExercise(exercise.id, exercise.name)
                    }
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Tab de Rutinas para entrenadores
 */
function RoutinesTab() {
  const { routines, loading, error, refreshRoutines, deleteRoutine } =
    useRoutines();

  const handleCreateRoutine = () => {
    Alert.alert("Crear Rutina", "¿Deseas crear una nueva rutina?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Crear",
        onPress: () => {
          router.push("/trainer/crear-rutina");
        },
      },
    ]);
  };

  const handleDeleteRoutine = (routineId: number, routineName: string) => {
    Alert.alert(
      "Eliminar Rutina",
      `¿Estás seguro que deseas eliminar "${routineName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteRoutine(routineId);
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshRoutines}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Header con botón de crear */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Rutinas</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateRoutine}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de rutinas */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshRoutines} />
        }
      >
        {routines.length === 0 ? (
          <Text style={styles.placeholderText}>
            No tienes rutinas creadas aún.
            {"\n"}¡Crea tu primera rutina!
          </Text>
        ) : (
          routines.map((routine) => (
            <View key={routine.id} style={styles.routineCard}>
              <View style={styles.cardContent}>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineDescription}>
                    {routine.exercises.length} ejercicios •{" "}
                    {routine.description || "Sin descripción"}
                  </Text>
                  <View style={styles.routineTags}>
                    <Text style={styles.tag}>
                      {routine.exercises.length} ejercicios
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="eye" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="create" size={20} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      handleDeleteRoutine(routine.id, routine.name)
                    }
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#f3f4f6",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#3b82f6",
  },

  // Content
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    paddingTop: 0,
  },

  // Section headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  createButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },

  // Lists
  listContainer: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginVertical: 40,
    lineHeight: 24,
  },

  // Exercise cards
  exerciseCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Routine cards
  routineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Card content
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Exercise info
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },

  // Routine info
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  routineTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },

  // Actions
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Error handling
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

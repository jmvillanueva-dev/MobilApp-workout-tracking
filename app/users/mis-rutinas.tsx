import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAuth,
  useSimpleWorkoutLogs,
  useUserRoutines,
} from "../../src/presentation/hooks";

interface ExerciseItemProps {
  exercise: {
    id: number;
    name: string;
    description?: string;
    sets?: number;
    reps?: string;
    restSeconds?: number;
  };
  onComplete?: () => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onComplete,
}) => (
  <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeader}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {onComplete && (
        <TouchableOpacity onPress={onComplete} style={styles.completeButton}>
          <MaterialIcons
            name="check-circle-outline"
            size={24}
            color="#4CAF50"
          />
        </TouchableOpacity>
      )}
    </View>

    {exercise.description && (
      <Text style={styles.exerciseDescription}>{exercise.description}</Text>
    )}

    <View style={styles.exerciseDetails}>
      {exercise.sets && (
        <View style={styles.detailItem}>
          <MaterialIcons name="fitness-center" size={16} color="#666" />
          <Text style={styles.detailText}>{exercise.sets} series</Text>
        </View>
      )}

      {exercise.reps && (
        <View style={styles.detailItem}>
          <MaterialIcons name="repeat" size={16} color="#666" />
          <Text style={styles.detailText}>{exercise.reps} reps</Text>
        </View>
      )}

      {exercise.restSeconds && (
        <View style={styles.detailItem}>
          <MaterialIcons name="timer" size={16} color="#666" />
          <Text style={styles.detailText}>
            {exercise.restSeconds}s descanso
          </Text>
        </View>
      )}
    </View>
  </View>
);

const MisRutinasScreen: React.FC = () => {
  const { usuario } = useAuth();
  const {
    todayRoutine,
    activePlan,
    isLoadingToday,
    isLoadingPlan,
    fetchTodayRoutine,
    fetchActivePlan,
  } = useUserRoutines(usuario?.id);
  const { createWorkoutLog, isCreating } = useSimpleWorkoutLogs(usuario?.id);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (usuario?.id) {
      fetchTodayRoutine();
      fetchActivePlan();
    }
  }, [usuario?.id, fetchTodayRoutine, fetchActivePlan]);

  // Manejar refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayRoutine(), fetchActivePlan()]);
    setRefreshing(false);
  };

  // Completar entrenamiento
  const handleCompleteWorkout = async () => {
    if (!usuario?.id || !todayRoutine?.id) return;

    Alert.alert(
      "Completar Entrenamiento",
      "¿Estás seguro de que quieres marcar este entrenamiento como completado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Completar",
          onPress: async () => {
            const result = await createWorkoutLog(
              todayRoutine.id,
              "Entrenamiento completado desde la app"
            );
            if (result.success) {
              Alert.alert("¡Éxito!", "Entrenamiento registrado correctamente");
              await fetchTodayRoutine(); // Refrescar datos
            } else {
              Alert.alert(
                "Error",
                result.error || "No se pudo registrar el entrenamiento"
              );
            }
          },
        },
      ]
    );
  };

  // Renderizar estado de carga
  if (isLoadingToday || isLoadingPlan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando rutinas...</Text>
      </View>
    );
  }

  // Renderizar cuando no hay plan activo
  if (!activePlan?.hasPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="event-busy" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No tienes un plan asignado</Text>
          <Text style={styles.emptySubtitle}>
            Contacta con tu entrenador para que te asigne un plan de
            entrenamiento.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar cuando no hay rutina para hoy
  if (!todayRoutine) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>{activePlan.planName}</Text>
            <Text style={styles.trainerName}>
              Por: {activePlan.trainerName}
            </Text>
          </View>

          <View style={styles.emptyContainer}>
            <MaterialIcons name="free-breakfast" size={80} color="#4CAF50" />
            <Text style={styles.emptyTitle}>¡Día de descanso!</Text>
            <Text style={styles.emptySubtitle}>
              No tienes entrenamiento programado para hoy. ¡Disfruta tu día
              libre!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Información del plan */}
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{activePlan.planName}</Text>
          <Text style={styles.trainerName}>Por: {activePlan.trainerName}</Text>
        </View>

        {/* Rutina del día */}
        <View style={styles.routineHeader}>
          <Text style={styles.routineTitle}>{todayRoutine.name}</Text>
          <Text style={styles.routineDate}>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>

        {todayRoutine.description && (
          <Text style={styles.routineDescription}>
            {todayRoutine.description}
          </Text>
        )}

        {/* Lista de ejercicios */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Ejercicios</Text>
          {todayRoutine.exercises?.map((exercise, index) => (
            <ExerciseItem key={`${exercise.id}-${index}`} exercise={exercise} />
          ))}
        </View>

        {/* Botón para completar entrenamiento */}
        <TouchableOpacity
          style={[
            styles.completeWorkoutButton,
            isCreating && styles.buttonDisabled,
          ]}
          onPress={handleCompleteWorkout}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="check-circle" size={24} color="white" />
          )}
          <Text style={styles.completeWorkoutText}>
            {isCreating ? "Guardando..." : "Completar Entrenamiento"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  planInfo: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  trainerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  routineHeader: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routineTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  routineDate: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
    textTransform: "capitalize",
  },
  routineDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exercisesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  completeButton: {
    padding: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  completeWorkoutButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  completeWorkoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MisRutinasScreen;

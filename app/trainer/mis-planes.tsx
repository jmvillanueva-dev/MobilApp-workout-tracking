import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrainingPlan } from "../../src/domain/models";
import { useTrainingPlans } from "../../src/presentation/hooks/useTrainingPlans";

const DIAS_SEMANA = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

export default function MisPlanes() {
  const { trainingPlans, loading, error, loadTrainingPlans, refreshPlans } =
    useTrainingPlans();

  useEffect(() => {
    loadTrainingPlans();
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshPlans();
    } catch (error) {
      console.error("Error refrescando planes:", error);
    }
  };

  const handleCreateNewPlan = () => {
    router.push("/trainer/crear-plan");
  };

  const handlePlanPress = (plan: TrainingPlan) => {
    Alert.alert(
      plan.name,
      `Cliente: ${
        plan.user?.fullName || "Sin cliente"
      }\nFecha inicio: ${plan.startDate.toLocaleDateString()}\nFecha fin: ${
        plan.endDate?.toLocaleDateString() || "Sin fecha fin"
      }\n\nRutinas asignadas: ${plan.routines.length}`,
      [
        { text: "Cerrar", style: "cancel" },
        {
          text: "Ver Detalles",
          onPress: () => console.log("Ver detalles del plan:", plan.id),
        },
      ]
    );
  };

  const formatearDiasRutinas = (routines: any[]) => {
    if (!routines || routines.length === 0) {
      return "Sin rutinas asignadas";
    }

    const diasOrdenados = routines
      .map((r) => r.dayOfWeek)
      .sort((a, b) => a - b)
      .map((dia) => DIAS_SEMANA[dia as keyof typeof DIAS_SEMANA])
      .join(", ");

    return `${routines.length} rutina${
      routines.length > 1 ? "s" : ""
    } - ${diasOrdenados}`;
  };

  const renderPlanItem = ({ item }: { item: TrainingPlan }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => handlePlanPress(item)}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{item.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Activo</Text>
        </View>
      </View>

      <View style={styles.planInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>
            {item.user?.fullName || "Sin asignar"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fecha inicio:</Text>
          <Text style={styles.value}>
            {item.startDate.toLocaleDateString()}
          </Text>
        </View>

        {item.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha fin:</Text>
            <Text style={styles.value}>
              {item.endDate.toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rutinas:</Text>
          <Text style={styles.value}>
            {formatearDiasRutinas(item.routines)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No tienes planes creados</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primer plan de entrenamiento para tus clientes
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateNewPlan}
      >
        <Text style={styles.createButtonText}>Crear Mi Primer Plan</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Planes</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Planes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateNewPlan}
        >
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trainingPlans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {trainingPlans.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total: {trainingPlans.length} plan
            {trainingPlans.length !== 1 ? "es" : ""}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  planInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summary: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

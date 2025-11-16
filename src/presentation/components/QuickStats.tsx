import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickStatsProps {
  exerciseCount: number;
  routineCount: number;
  planCount: number;
  onPressExercises?: () => void;
  onPressRoutines?: () => void;
  onPressPlans?: () => void;
}

/**
 * Componente de estadísticas rápidas para entrenadores
 */
export function QuickStats({
  exerciseCount = 0,
  routineCount = 0,
  planCount = 0,
  onPressExercises,
  onPressRoutines,
  onPressPlans,
}: QuickStatsProps) {
  const stats = [
    {
      icon: "barbell",
      count: exerciseCount,
      label: "Ejercicios",
      color: "#3b82f6",
      bgColor: "#dbeafe",
      onPress: onPressExercises,
    },
    {
      icon: "list",
      count: routineCount,
      label: "Rutinas",
      color: "#10b981",
      bgColor: "#d1fae5",
      onPress: onPressRoutines,
    },
    {
      icon: "calendar",
      count: planCount,
      label: "Planes",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      onPress: onPressPlans,
    },
  ] as const;

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.statCard, { backgroundColor: stat.bgColor }]}
          onPress={stat.onPress}
          disabled={!stat.onPress}
        >
          <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
            <Ionicons name={stat.icon as any} size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>{stat.count}</Text>
          <Text style={[styles.statLabel, { color: stat.color }]}>
            {stat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

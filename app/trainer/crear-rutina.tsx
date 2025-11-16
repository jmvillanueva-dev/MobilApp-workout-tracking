import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Exercise } from "../../src/domain/models";
import { useExercises, useRoutines } from "../../src/presentation/hooks";

interface ExerciseSelection {
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime?: number;
  weight?: number;
  notes?: string;
}

interface RoutineFormData {
  name: string;
  description?: string;
  daysOfWeek: string[];
  exercises: ExerciseSelection[];
}

/**
 * Pantalla para crear nuevas rutinas
 */
export default function CreateRoutineScreen() {
  const {
    exercises,
    fetchExercises,
    loading: exercisesLoading,
  } = useExercises();
  const { createRoutine } = useRoutines();

  // Estados del formulario
  const [formData, setFormData] = useState<RoutineFormData>({
    name: "",
    description: "",
    daysOfWeek: [],
    exercises: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Validaciones
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    daysOfWeek?: string;
    exercises?: string;
  }>({});

  // Días de la semana
  const daysOfWeek = [
    { key: "monday", label: "Lunes", short: "L" },
    { key: "tuesday", label: "Martes", short: "M" },
    { key: "wednesday", label: "Miércoles", short: "X" },
    { key: "thursday", label: "Jueves", short: "J" },
    { key: "friday", label: "Viernes", short: "V" },
    { key: "saturday", label: "Sábado", short: "S" },
    { key: "sunday", label: "Domingo", short: "D" },
  ];

  useEffect(() => {
    fetchExercises();
  }, []);

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = "Selecciona al menos un día";
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = "Agrega al menos un ejercicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Actualizar campo del formulario
   */
  const updateFormField = (field: keyof RoutineFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Toggle día de la semana
   */
  const toggleDay = (dayKey: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayKey)
        ? prev.daysOfWeek.filter((d) => d !== dayKey)
        : [...prev.daysOfWeek, dayKey],
    }));
  };

  /**
   * Agregar ejercicio a la rutina
   */
  const addExercise = (exercise: Exercise) => {
    const newExerciseSelection: ExerciseSelection = {
      exercise,
      sets: 3,
      reps: 10,
      restTime: 60,
    };

    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExerciseSelection],
    }));
    setShowExerciseSelector(false);
  };

  /**
   * Remover ejercicio de la rutina
   */
  const removeExercise = (index: number) => {
    Alert.alert(
      "Remover ejercicio",
      "¿Estás seguro que deseas remover este ejercicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            setFormData((prev) => ({
              ...prev,
              exercises: prev.exercises.filter((_, i) => i !== index),
            }));
          },
        },
      ]
    );
  };

  /**
   * Actualizar configuración de ejercicio
   */
  const updateExerciseConfig = (
    index: number,
    field: keyof Omit<ExerciseSelection, "exercise">,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  /**
   * Mover ejercicio hacia arriba
   */
  const moveExerciseUp = (index: number) => {
    if (index > 0) {
      setFormData((prev) => {
        const newExercises = [...prev.exercises];
        [newExercises[index - 1], newExercises[index]] = [
          newExercises[index],
          newExercises[index - 1],
        ];
        return { ...prev, exercises: newExercises };
      });
    }
  };

  /**
   * Mover ejercicio hacia abajo
   */
  const moveExerciseDown = (index: number) => {
    if (index < formData.exercises.length - 1) {
      setFormData((prev) => {
        const newExercises = [...prev.exercises];
        [newExercises[index], newExercises[index + 1]] = [
          newExercises[index + 1],
          newExercises[index],
        ];
        return { ...prev, exercises: newExercises };
      });
    }
  };

  /**
   * Crear rutina
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const routineData = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        daysOfWeek: formData.daysOfWeek,
        exercises: formData.exercises.map((ex, order) => ({
          exerciseId: ex.exercise.id,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          weight: ex.weight,
          notes: ex.notes,
          order: order + 1,
        })),
      };

      console.log("Creando rutina:", routineData);

      const result = await createRoutine(routineData);

      if (result.success) {
        Alert.alert("Éxito", "Rutina creada correctamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo crear la rutina");
      }
    } catch (error: any) {
      console.error("Error creando rutina:", error);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancelar y regresar
   */
  const handleCancel = () => {
    if (formData.name.trim() || formData.exercises.length > 0) {
      Alert.alert(
        "Descartar cambios",
        "¿Estás seguro que deseas descartar los cambios?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  /**
   * Renderizar selector de ejercicios
   */
  const renderExerciseSelector = () => (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Ejercicio</Text>
          <TouchableOpacity
            onPress={() => setShowExerciseSelector(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.exerciseItem}
              onPress={() => addExercise(item)}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.exerciseDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Ionicons name="add" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  /**
   * Renderizar ejercicio configurado
   */
  const renderExerciseConfig = ({
    item,
    index,
  }: {
    item: ExerciseSelection;
    index: number;
  }) => (
    <View style={styles.exerciseConfig}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseConfigName}>{item.exercise.name}</Text>
          <View style={styles.exerciseOrder}>
            <Text style={styles.orderText}>#{index + 1}</Text>
          </View>
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            onPress={() => moveExerciseUp(index)}
            disabled={index === 0}
            style={[
              styles.actionButton,
              index === 0 && styles.actionButtonDisabled,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={16}
              color={index === 0 ? "#9ca3af" : "#374151"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => moveExerciseDown(index)}
            disabled={index === formData.exercises.length - 1}
            style={[
              styles.actionButton,
              index === formData.exercises.length - 1 &&
                styles.actionButtonDisabled,
            ]}
          >
            <Ionicons
              name="arrow-down"
              size={16}
              color={
                index === formData.exercises.length - 1 ? "#9ca3af" : "#374151"
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeExercise(index)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.configRow}>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Series</Text>
          <TextInput
            style={styles.configInput}
            value={item.sets.toString()}
            onChangeText={(value) =>
              updateExerciseConfig(index, "sets", parseInt(value) || 0)
            }
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Reps</Text>
          <TextInput
            style={styles.configInput}
            value={item.reps.toString()}
            onChangeText={(value) =>
              updateExerciseConfig(index, "reps", parseInt(value) || 0)
            }
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>Descanso (s)</Text>
          <TextInput
            style={styles.configInput}
            value={item.restTime?.toString() || ""}
            onChangeText={(value) =>
              updateExerciseConfig(
                index,
                "restTime",
                parseInt(value) || undefined
              )
            }
            keyboardType="numeric"
            maxLength={3}
            placeholder="60"
          />
        </View>
      </View>

      <View style={styles.configRow}>
        <View style={[styles.configItem, { flex: 1 }]}>
          <Text style={styles.configLabel}>Peso (kg)</Text>
          <TextInput
            style={styles.configInput}
            value={item.weight?.toString() || ""}
            onChangeText={(value) =>
              updateExerciseConfig(
                index,
                "weight",
                parseFloat(value) || undefined
              )
            }
            keyboardType="numeric"
            placeholder="Opcional"
          />
        </View>
      </View>

      <View style={styles.configItem}>
        <Text style={styles.configLabel}>Notas</Text>
        <TextInput
          style={styles.notesInput}
          value={item.notes || ""}
          onChangeText={(value) => updateExerciseConfig(index, "notes", value)}
          placeholder="Notas adicionales..."
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  if (showExerciseSelector) {
    return renderExerciseSelector();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Rutina</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.headerButton, styles.saveButton]}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Nombre de la rutina */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nombre de la rutina <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => updateFormField("name", value)}
            placeholder="Ej. Rutina de pecho y tríceps"
            placeholderTextColor="#9ca3af"
            maxLength={100}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Descripción */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => updateFormField("description", value)}
            placeholder="Describe el objetivo de la rutina..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Días de la semana */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Días de entrenamiento <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  formData.daysOfWeek.includes(day.key) &&
                    styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    formData.daysOfWeek.includes(day.key) &&
                      styles.dayButtonTextActive,
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.daysOfWeek && (
            <Text style={styles.errorText}>{errors.daysOfWeek}</Text>
          )}
        </View>

        {/* Ejercicios */}
        <View style={styles.formGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>
              Ejercicios <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowExerciseSelector(true)}
              style={styles.addButton}
              disabled={exercisesLoading}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {formData.exercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No hay ejercicios</Text>
              <Text style={styles.emptyStateSubtext}>
                Agrega ejercicios para crear tu rutina
              </Text>
            </View>
          ) : (
            <FlatList
              data={formData.exercises}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderExerciseConfig}
              ItemSeparatorComponent={() => (
                <View style={styles.exerciseSeparator} />
              )}
              scrollEnabled={false}
            />
          )}
          {errors.exercises && (
            <Text style={styles.errorText}>{errors.exercises}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },

  // Form
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 80,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },

  // Days
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#3b82f6",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  dayButtonTextActive: {
    color: "#ffffff",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },

  // Empty state
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },

  // Exercise config
  exerciseConfig: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseConfigName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
  },
  exerciseOrder: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  orderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  exerciseSeparator: {
    height: 12,
  },

  // Config inputs
  configRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  configItem: {
    flex: 1,
    marginRight: 12,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  configInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1f2937",
    textAlign: "center",
  },
  notesInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 60,
    textAlignVertical: "top",
  },

  // Modal
  modal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 4,
  },

  // Exercise item
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
  },
});

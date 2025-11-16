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
import { DayOfWeek, getDayName } from "../../src/domain/models";
import { useRoutines, useTrainingPlans } from "../../src/presentation/hooks";

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface PlanFormData {
  name: string;
  userId: string;
  startDate: string;
  endDate: string;
  routines: {
    routineId: number;
    dayOfWeek: number;
    routine?: {
      id: number;
      name: string;
      description?: string;
    };
  }[];
}

/**
 * Pantalla para crear planes de entrenamiento
 */
export default function CreateTrainingPlanScreen() {
  // const { usuario } = useAuth(); // TODO: usar para validaciones de permisos
  const { routines, loadRoutines } = useRoutines();
  const { createTrainingPlan, getAvailableUsers } = useTrainingPlans();

  // Estados del formulario
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    userId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    routines: [],
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Validaciones
  const [errors, setErrors] = useState<{
    name?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    routines?: string;
  }>({});

  // Días de la semana
  const daysOfWeek = [
    { value: DayOfWeek.LUNES, label: "Lunes" },
    { value: DayOfWeek.MARTES, label: "Martes" },
    { value: DayOfWeek.MIERCOLES, label: "Miércoles" },
    { value: DayOfWeek.JUEVES, label: "Jueves" },
    { value: DayOfWeek.VIERNES, label: "Viernes" },
    { value: DayOfWeek.SABADO, label: "Sábado" },
    { value: DayOfWeek.DOMINGO, label: "Domingo" },
  ];

  useEffect(() => {
    loadRoutines();
    loadUsers();
  }, []); // Se ejecuta en cada render para cargar datos

  /**
   * Cargar usuarios disponibles
   */
  const loadUsers = async () => {
    try {
      console.log("🔄 Cargando usuarios disponibles...");
      const users = await getAvailableUsers();
      setAvailableUsers(users);
      console.log("✅ Usuarios cargados:", users.length);
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error);
      setAvailableUsers([]);
    }
  };

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

    if (!formData.userId) {
      newErrors.userId = "Debe seleccionar un usuario";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startDate = "La fecha no puede ser anterior a hoy";
      }
    }

    if (formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        newErrors.endDate = "La fecha de fin debe ser posterior al inicio";
      }
    }

    if (formData.routines.length === 0) {
      newErrors.routines = "Debe asignar al menos una rutina";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Seleccionar usuario
   */
  const selectUser = (user: User) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, userId: user.id }));
    setShowUserSelector(false);
  };

  /**
   * Agregar rutina al día seleccionado
   */
  const addRoutineToDay = (routineId: number) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    // Verificar si ya hay una rutina para ese día
    const existingIndex = formData.routines.findIndex(
      (r) => r.dayOfWeek === selectedDay
    );

    const newRoutineAssignment = {
      routineId,
      dayOfWeek: selectedDay,
      routine: {
        id: routine.id,
        name: routine.name,
        description: routine.description,
      },
    };

    setFormData((prev) => ({
      ...prev,
      routines:
        existingIndex >= 0
          ? prev.routines.map((r, i) =>
              i === existingIndex ? newRoutineAssignment : r
            )
          : [...prev.routines, newRoutineAssignment],
    }));

    setShowRoutineSelector(false);
  };

  /**
   * Remover rutina de un día
   */
  const removeRoutineFromDay = (dayOfWeek: number) => {
    setFormData((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.dayOfWeek !== dayOfWeek),
    }));
  };

  /**
   * Obtener rutina asignada a un día
   */
  const getRoutineForDay = (dayOfWeek: number) => {
    return formData.routines.find((r) => r.dayOfWeek === dayOfWeek);
  };

  /**
   * Crear plan de entrenamiento
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const planData = {
        name: formData.name.trim(),
        userId: formData.userId,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        routines: formData.routines.map((r) => ({
          routineId: r.routineId,
          dayOfWeek: r.dayOfWeek,
        })),
      };

      console.log("Creando plan:", planData);
      await createTrainingPlan(planData);

      Alert.alert(
        "Plan Creado",
        `Plan "${formData.name}" creado exitosamente para ${selectedUser?.fullName}`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creando plan:", error);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancelar y regresar
   */
  const handleCancel = () => {
    if (
      formData.name.trim() ||
      formData.userId ||
      formData.routines.length > 0
    ) {
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

  // Renderizar selector de usuarios
  if (showUserSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Usuario</Text>
          <TouchableOpacity
            onPress={() => setShowUserSelector(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={availableUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => selectUser(item)}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {item.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.fullName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.userList}
        />
      </SafeAreaView>
    );
  }

  // Renderizar selector de rutinas
  if (showRoutineSelector) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Rutina para {getDayName(selectedDay)}
          </Text>
          <TouchableOpacity
            onPress={() => setShowRoutineSelector(false)}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={routines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.routineItem}
              onPress={() => addRoutineToDay(item.id)}
            >
              <View style={styles.routineInfo}>
                <Text style={styles.routineName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.routineDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Ionicons name="add" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.routineList}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Plan</Text>
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
        {/* Nombre del plan */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nombre del plan <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Ej. Plan de fuerza 8 semanas"
            placeholderTextColor="#9ca3af"
            maxLength={100}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Selección de usuario */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Usuario asignado <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.selectorButton, errors.userId && styles.inputError]}
            onPress={() => setShowUserSelector(true)}
          >
            <View style={styles.selectorContent}>
              {selectedUser ? (
                <View style={styles.selectedUserInfo}>
                  <View style={styles.selectedUserAvatar}>
                    <Text style={styles.selectedUserAvatarText}>
                      {selectedUser.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.selectedUserName}>
                      {selectedUser.fullName}
                    </Text>
                    <Text style={styles.selectedUserEmail}>
                      {selectedUser.email}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.selectorPlaceholder}>
                  Seleccionar usuario
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
          {errors.userId && (
            <Text style={styles.errorText}>{errors.userId}</Text>
          )}
        </View>

        {/* Fechas */}
        <View style={styles.dateRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>
              Fecha de inicio <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, errors.startDate && styles.inputError]}
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, startDate: text }))
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
            {errors.startDate && (
              <Text style={styles.errorText}>{errors.startDate}</Text>
            )}
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Fecha de fin</Text>
            <TextInput
              style={[styles.textInput, errors.endDate && styles.inputError]}
              value={formData.endDate}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, endDate: text }))
              }
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
            />
            {errors.endDate && (
              <Text style={styles.errorText}>{errors.endDate}</Text>
            )}
          </View>
        </View>

        {/* Rutinas por días */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Rutinas por día <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.labelSubtitle}>
            Asigna rutinas específicas para cada día de la semana
          </Text>

          <View style={styles.daysContainer}>
            {daysOfWeek.map((day) => {
              const assignedRoutine = getRoutineForDay(day.value);
              return (
                <View key={day.value} style={styles.dayCard}>
                  <Text style={styles.dayLabel}>{day.label}</Text>

                  {assignedRoutine ? (
                    <View style={styles.assignedRoutine}>
                      <Text
                        style={styles.assignedRoutineName}
                        numberOfLines={1}
                      >
                        {assignedRoutine.routine?.name}
                      </Text>
                      <View style={styles.routineActions}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedDay(day.value);
                            setShowRoutineSelector(true);
                          }}
                          style={styles.routineActionButton}
                        >
                          <Ionicons name="create" size={16} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeRoutineFromDay(day.value)}
                          style={styles.routineActionButton}
                        >
                          <Ionicons name="trash" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addRoutineButton}
                      onPress={() => {
                        setSelectedDay(day.value);
                        setShowRoutineSelector(true);
                      }}
                    >
                      <Ionicons name="add" size={20} color="#6b7280" />
                      <Text style={styles.addRoutineText}>Agregar rutina</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
          {errors.routines && (
            <Text style={styles.errorText}>{errors.routines}</Text>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              El plan será asignado al usuario seleccionado y aparecerá en su
              dashboard
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Las rutinas se ejecutarán en los días asignados según el
              calendario
            </Text>
          </View>
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
  labelSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
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
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },

  // Date row
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // User Selector
  selectorButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorContent: {
    flex: 1,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  selectedUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedUserAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  selectedUserEmail: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Days container
  daysContainer: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  assignedRoutine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  assignedRoutineName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1e40af",
  },
  routineActions: {
    flexDirection: "row",
    gap: 8,
  },
  routineActionButton: {
    padding: 4,
  },
  addRoutineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
  },
  addRoutineText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },

  // Modal styles
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  modalCloseButton: {
    padding: 8,
  },

  // User list
  userList: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },

  // Routine list
  routineList: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  routineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  routineDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },

  // Info section
  infoSection: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    lineHeight: 20,
  },
});

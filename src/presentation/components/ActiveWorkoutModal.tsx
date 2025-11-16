import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth, useWorkoutLogs } from "../hooks";

const { width } = Dimensions.get("window");

interface ExerciseSetProps {
  set: any;
  setIndex: number;
  onUpdate: (setIndex: number, field: string, value: string) => void;
  onComplete: (setIndex: number) => void;
}

const ExerciseSet: React.FC<ExerciseSetProps> = ({
  set,
  setIndex,
  onUpdate,
  onComplete,
}) => {
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.reps?.toString() || "");

  const handleWeightChange = (value: string) => {
    setWeight(value);
    onUpdate(setIndex, "weight", value);
  };

  const handleRepsChange = (value: string) => {
    setReps(value);
    onUpdate(setIndex, "reps", value);
  };

  const isCompleted = set.completed;
  const canComplete = weight && reps;

  return (
    <View style={[styles.setContainer, isCompleted && styles.completedSet]}>
      <View style={styles.setHeader}>
        <Text style={styles.setNumber}>Serie {setIndex + 1}</Text>
        {isCompleted && (
          <MaterialIcons name="check-circle" size={20} color="#34C759" />
        )}
      </View>

      <View style={styles.setInputs}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Peso (kg)</Text>
          <TextInput
            style={[styles.input, isCompleted && styles.completedInput]}
            value={weight}
            onChangeText={handleWeightChange}
            placeholder="0"
            keyboardType="decimal-pad"
            editable={!isCompleted}
          />
        </View>

        <Text style={styles.separator}>×</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={[styles.input, isCompleted && styles.completedInput]}
            value={reps}
            onChangeText={handleRepsChange}
            placeholder="0"
            keyboardType="number-pad"
            editable={!isCompleted}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            !canComplete && styles.disabledButton,
            isCompleted && styles.completedButton,
          ]}
          onPress={() => onComplete(setIndex)}
          disabled={!canComplete || isCompleted}
        >
          <MaterialIcons
            name={isCompleted ? "check" : "check"}
            size={20}
            color={isCompleted ? "#34C759" : canComplete ? "white" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface ExerciseCardProps {
  exercise: any;
  exerciseIndex: number;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string
  ) => void;
  onCompleteSet: (exerciseIndex: number, setIndex: number) => void;
  onAddNote: (exerciseIndex: number, note: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  onUpdateSet,
  onCompleteSet,
  onAddNote,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState(exercise.notes || "");

  const completedSets = exercise.sets.filter(
    (set: any) => set.completed
  ).length;
  const totalSets = exercise.sets.length;
  const isCompleted = completedSets === totalSets;

  const handleSaveNote = () => {
    onAddNote(exerciseIndex, note);
    setShowNotes(false);
  };

  return (
    <View
      style={[styles.exerciseCard, isCompleted && styles.completedExercise]}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseProgress}>
            {completedSets}/{totalSets} series completadas
          </Text>
        </View>

        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={styles.noteButton}
            onPress={() => setShowNotes(!showNotes)}
          >
            <MaterialIcons
              name={exercise.notes ? "note" : "note-add"}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>

          {isCompleted && (
            <MaterialIcons name="check-circle" size={24} color="#34C759" />
          )}
        </View>
      </View>

      {exercise.instructions && (
        <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
      )}

      <View style={styles.setsContainer}>
        {exercise.sets.map((set: any, setIndex: number) => (
          <ExerciseSet
            key={setIndex}
            set={set}
            setIndex={setIndex}
            onUpdate={(setIdx, field, value) =>
              onUpdateSet(exerciseIndex, setIdx, field, value)
            }
            onComplete={(setIdx) => onCompleteSet(exerciseIndex, setIdx)}
          />
        ))}
      </View>

      {showNotes && (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            value={note}
            onChangeText={setNote}
            placeholder="Añade notas sobre este ejercicio..."
            multiline
            numberOfLines={3}
          />
          <View style={styles.notesActions}>
            <TouchableOpacity
              style={styles.cancelNoteButton}
              onPress={() => setShowNotes(false)}
            >
              <Text style={styles.cancelNoteText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveNoteButton}
              onPress={handleSaveNote}
            >
              <Text style={styles.saveNoteText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

interface WorkoutTimerProps {
  startTime: Date;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.timerContainer}>
      <MaterialIcons name="timer" size={16} color="#666" />
      <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
    </View>
  );
};

interface ActiveWorkoutProps {
  visible: boolean;
  routine: any;
  onFinish: (workoutData: any) => void;
  onCancel: () => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutProps> = ({
  visible,
  routine,
  onFinish,
  onCancel,
}) => {
  const { usuario } = useAuth();
  const { crearWorkoutLog, isCreating } = useWorkoutLogs(usuario?.id);

  const [startTime] = useState(new Date());
  const [exercises, setExercises] = useState<any[]>([]);
  const [overallNotes, setOverallNotes] = useState("");
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    if (routine?.exercises) {
      // Inicializar ejercicios con sets vacíos
      const initialExercises = routine.exercises.map((exercise: any) => ({
        ...exercise,
        sets: Array.from({ length: exercise.sets || 3 }, () => ({
          weight: null,
          reps: null,
          completed: false,
        })),
        notes: "",
      }));
      setExercises(initialExercises);
    }
  }, [routine]);

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] =
        field === "weight" || field === "reps"
          ? parseFloat(value) || null
          : value;
      return updated;
    });
  };

  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];

      if (set.weight && set.reps) {
        set.completed = true;
      }
      return updated;
    });
  };

  const handleAddNote = (exerciseIndex: number, note: string) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex].notes = note;
      return updated;
    });
  };

  const getWorkoutProgress = () => {
    const totalSets = exercises.reduce(
      (acc, exercise) => acc + exercise.sets.length,
      0
    );
    const completedSets = exercises.reduce(
      (acc, exercise) =>
        acc + exercise.sets.filter((set: any) => set.completed).length,
      0
    );

    return { completed: completedSets, total: totalSets };
  };

  const handleFinishWorkout = async () => {
    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000
    ); // minutos
    const progress = getWorkoutProgress();

    const workoutData = {
      routineId: routine.id,
      duration,
      notes: overallNotes,
      exercises: exercises
        .map((exercise) => ({
          exerciseId: exercise.id,
          sets: exercise.sets
            .filter((set: any) => set.completed)
            .map((set: any) => ({
              weight: set.weight,
              reps: set.reps,
            })),
          notes: exercise.notes,
        }))
        .filter((exercise) => exercise.sets.length > 0), // Solo ejercicios con al menos 1 serie completada
    };

    if (workoutData.exercises.length === 0) {
      Alert.alert(
        "Workout incompleto",
        "Debes completar al menos una serie para guardar el entrenamiento.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    try {
      const result = await crearWorkoutLog(workoutData);
      if (result.success) {
        onFinish(workoutData);
        Alert.alert(
          "¡Excelente trabajo!",
          `Entrenamiento completado en ${duration} minutos. ${progress.completed}/${progress.total} series realizadas.`,
          [{ text: "OK", style: "default" }]
        );
      } else {
        Alert.alert(
          "Error",
          result.error || "Error guardando el entrenamiento"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado guardando el entrenamiento");
    }
  };

  const handleCancelWorkout = () => {
    const progress = getWorkoutProgress();

    if (progress.completed > 0) {
      Alert.alert(
        "Cancelar Entrenamiento",
        "¿Estás seguro? Perderás todo el progreso del entrenamiento actual.",
        [
          { text: "Continuar Entrenando", style: "cancel" },
          { text: "Sí, Cancelar", style: "destructive", onPress: onCancel },
        ]
      );
    } else {
      onCancel();
    }
  };

  const progress = getWorkoutProgress();
  const progressPercentage =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.workoutContainer}>
        {/* Header */}
        <View style={styles.workoutHeader}>
          <TouchableOpacity onPress={handleCancelWorkout}>
            <MaterialIcons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>

          <View style={styles.workoutInfo}>
            <Text style={styles.routineName}>{routine?.name}</Text>
            <WorkoutTimer startTime={startTime} />
          </View>

          <TouchableOpacity onPress={() => setShowFinishModal(true)}>
            <Text style={styles.finishButton}>Finalizar</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed}/{progress.total} series
          </Text>
        </View>

        {/* Exercises */}
        <ScrollView style={styles.exercisesContainer}>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id || index}
              exercise={exercise}
              exerciseIndex={index}
              onUpdateSet={handleUpdateSet}
              onCompleteSet={handleCompleteSet}
              onAddNote={handleAddNote}
            />
          ))}

          {/* Overall Notes */}
          <View style={styles.overallNotesContainer}>
            <Text style={styles.notesLabel}>Notas del Entrenamiento</Text>
            <TextInput
              style={styles.overallNotesInput}
              value={overallNotes}
              onChangeText={setOverallNotes}
              placeholder="¿Cómo te sentiste durante el entrenamiento?"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Finish Confirmation Modal */}
        <Modal visible={showFinishModal} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.finishModalContent}>
              <Text style={styles.finishModalTitle}>
                Finalizar Entrenamiento
              </Text>
              <Text style={styles.finishModalText}>
                Has completado {progress.completed} de {progress.total} series.
              </Text>
              <Text style={styles.finishModalSubtext}>
                ¿Quieres guardar tu progreso?
              </Text>

              <View style={styles.finishModalActions}>
                <TouchableOpacity
                  style={styles.cancelFinishButton}
                  onPress={() => setShowFinishModal(false)}
                >
                  <Text style={styles.cancelFinishText}>Continuar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmFinishButton}
                  onPress={handleFinishWorkout}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmFinishText}>Finalizar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  workoutContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60, // Para el notch
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  workoutInfo: {
    alignItems: "center",
  },
  routineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  finishButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timerText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    fontFamily: "monospace",
  },
  progressContainer: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  exercisesContainer: {
    flex: 1,
    padding: 20,
  },
  exerciseCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completedExercise: {
    borderWidth: 2,
    borderColor: "#34C759",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  exerciseProgress: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noteButton: {
    padding: 4,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  setsContainer: {
    gap: 12,
  },
  setContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  completedSet: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#34C759",
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  setInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
    textAlign: "center",
  },
  completedInput: {
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
  },
  separator: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  completedButton: {
    backgroundColor: "#34C759",
  },
  notesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "white",
    height: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  notesActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  cancelNoteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelNoteText: {
    color: "#666",
    fontSize: 14,
  },
  saveNoteButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveNoteText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  overallNotesContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  overallNotesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
    height: 80,
    textAlignVertical: "top",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  finishModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 300,
  },
  finishModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  finishModalText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  finishModalSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  finishModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelFinishButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cancelFinishText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  confirmFinishButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmFinishText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});

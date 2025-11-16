import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExercises } from "@/src/presentation/hooks";

/**
 * Pantalla para crear nuevos ejercicios
 */
export default function CreateExerciseScreen() {
  const { createExerciseWithVideo } = useExercises();

  // Estados del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    } else if (name.trim().length > 100) {
      newErrors.name = "El nombre no puede exceder 100 caracteres";
    }

    if (description && description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Seleccionar video desde galería
   */
  const selectVideo = async () => {
    try {
      // Pedir permisos
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Necesitamos permisos para acceder a tu galería de videos."
        );
        return;
      }

      // Seleccionar video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        console.log("Video seleccionado:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error seleccionando video:", error);
      Alert.alert("Error", "No se pudo seleccionar el video");
    }
  };

  /**
   * Grabar video con cámara
   */
  const recordVideo = async () => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Necesitamos permisos para usar tu cámara."
        );
        return;
      }

      // Grabar video
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        console.log("Video grabado:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error grabando video:", error);
      Alert.alert("Error", "No se pudo grabar el video");
    }
  };

  /**
   * Mostrar opciones de video
   */
  const showVideoOptions = () => {
    Alert.alert(
      "Seleccionar Video",
      "Elige una opción para agregar un video demostrativo",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Galería", onPress: selectVideo },
        { text: "Grabar", onPress: recordVideo },
      ]
    );
  };

  /**
   * Remover video seleccionado
   */
  const removeVideo = () => {
    Alert.alert("Remover Video", "¿Estás seguro que deseas remover el video?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setVideoUri(null);
          setVideoUrl(null);
        },
      },
    ]);
  };

  /**
   * Crear ejercicio
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const exerciseData = {
        name: name.trim(),
        description: description.trim() || undefined,
        videoUrl: videoUrl || undefined,
      };

      console.log("Creando ejercicio:", exerciseData);

      const result = await createExerciseWithVideo(
        { name, description },
        videoUri || undefined
      );

      if (result.success) {
        Alert.alert("Éxito", "Ejercicio creado correctamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo crear el ejercicio");
      }
    } catch (error: any) {
      console.error("Error creando ejercicio:", error);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancelar y regresar
   */
  const handleCancel = () => {
    if (name.trim() || description.trim() || videoUri) {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Ejercicio</Text>
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
        {/* Nombre del ejercicio */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nombre del ejercicio <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Press de banca"
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
            value={description}
            onChangeText={setDescription}
            placeholder="Describe cómo realizar el ejercicio..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {description.length}/500 caracteres
          </Text>
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Video demostrativo */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Video demostrativo</Text>
          <Text style={styles.labelSubtitle}>
            Agrega un video que muestre cómo realizar el ejercicio correctamente
          </Text>

          {videoUri ? (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: videoUri }}
                style={styles.videoPreview}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
              <View style={styles.videoActions}>
                <TouchableOpacity
                  onPress={showVideoOptions}
                  style={styles.videoButton}
                >
                  <Ionicons name="refresh" size={20} color="#3b82f6" />
                  <Text style={styles.videoButtonText}>Cambiar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={removeVideo}
                  style={styles.videoButton}
                >
                  <Ionicons name="trash" size={20} color="#ef4444" />
                  <Text style={[styles.videoButtonText, { color: "#ef4444" }]}>
                    Remover
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={showVideoOptions}
              style={styles.videoPlaceholder}
            >
              <Ionicons name="videocam" size={48} color="#9ca3af" />
              <Text style={styles.videoPlaceholderText}>Agregar video</Text>
              <Text style={styles.videoPlaceholderSubtext}>
                Toca para seleccionar o grabar un video
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Los ejercicios creados estarán disponibles para usar en tus
              rutinas
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Los videos deben ser de máximo 30 segundos
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
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    minHeight: 100,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },

  // Video
  videoContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  videoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000000",
  },
  videoActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  videoButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
    color: "#3b82f6",
  },
  videoPlaceholder: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginTop: 12,
  },
  videoPlaceholderSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },

  // Info section
  infoSection: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
    marginLeft: 8,
    lineHeight: 20,
  },
});

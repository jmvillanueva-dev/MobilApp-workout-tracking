import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserRole } from "../../src/domain/models/User";
import { useAuth } from "../../src/presentation/contexts/AuthProvider";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("usuario");
  const [loading, setLoading] = useState(false);

  const { registrar } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Error", "El email es requerido");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Ingresa un email válido");
      return false;
    }

    if (!password.trim()) {
      Alert.alert("Error", "La contraseña es requerida");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    if (!fullName.trim()) {
      Alert.alert("Error", "El nombre completo es requerido");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Iniciando registro con:", {
        email: email.trim(),
        role: selectedRole,
        fullName: fullName.trim(),
      });

      const resultado = await registrar(
        email.trim(),
        password,
        selectedRole,
        fullName.trim()
      );

      console.log("Resultado del registro:", resultado);

      if (resultado.success) {
        if (resultado.needsConfirmation) {
          Alert.alert(
            "Registro exitoso",
            "Tu cuenta ha sido creada correctamente. Por favor, verifica tu email antes de iniciar sesión.",
            [
              {
                text: "OK",
                onPress: () => router.push("./login"),
              },
            ]
          );
        } else {
          Alert.alert(
            "Registro exitoso",
            "Tu cuenta ha sido creada correctamente.",
            [
              {
                text: "OK",
                onPress: () => router.push("./login"),
              },
            ]
          );
        }
      } else {
        console.error("Error de registro:", resultado.error);
        const errorMessage = resultado.error || "No se pudo crear la cuenta";
        Alert.alert(
          "Error de registro",
          `${errorMessage}\n\nSi el problema persiste, revisa la configuración de Supabase.`
        );
      }
    } catch (error: any) {
      console.error("Error inesperado:", error);
      Alert.alert(
        "Error",
        `Error inesperado: ${
          error.message || "Error desconocido"
        }\n\nRevisa la consola para más detalles.`
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("./login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a nuestra comunidad fitness
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ingresa tu nombre completo"
                autoComplete="name"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ingresa tu email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña (mín. 6 caracteres)"
                secureTextEntry
                autoComplete="new-password"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu contraseña"
                secureTextEntry
                autoComplete="new-password"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Usuario</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "usuario" && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole("usuario")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === "usuario" &&
                        styles.roleButtonTextSelected,
                    ]}
                  >
                    Usuario
                  </Text>
                  <Text style={styles.roleDescription}>
                    Quiero entrenar y hacer seguimiento
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === "entrenador" && styles.roleButtonSelected,
                  ]}
                  onPress={() => setSelectedRole("entrenador")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === "entrenador" &&
                        styles.roleButtonTextSelected,
                    ]}
                  >
                    Entrenador
                  </Text>
                  <Text style={styles.roleDescription}>
                    Quiero crear rutinas y entrenar usuarios
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={navigateToLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Ya tengo una cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#6b7280",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  roleContainer: {
    gap: 12,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  roleButtonSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  roleButtonTextSelected: {
    color: "#3b82f6",
  },
  roleDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
});

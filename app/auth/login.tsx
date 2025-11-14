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

import { useAuth } from "../../src/presentation/contexts/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarSesion, setRecordarSesion] = useState(true);
  const [loading, setLoading] = useState(false);

  const { iniciarSesion } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const resultado = await iniciarSesion(
        email.trim(),
        password,
        recordarSesion
      );

      if (resultado.success) {
        // Navegación automática será manejada por el AuthProvider
        // No mostramos alert para una transición más fluida
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Error de autenticación",
          resultado.error || "Credenciales incorrectas"
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Error inesperado al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("./register");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

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
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRecordarSesion(!recordarSesion)}
            disabled={loading}
          >
            <View
              style={[
                styles.checkbox,
                recordarSesion && styles.checkboxChecked,
              ]}
            >
              {recordarSesion && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Recordar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={navigateToRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>Crear cuenta nueva</Text>
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#374151",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  loginButtonText: {
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
  registerButton: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
});

import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Componente para el input de mensajes con funcionalidad de typing
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingChange,
  placeholder = "Escribe un mensaje...",
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingCallRef = useRef<number>(0);

  // Función para manejar el estado de typing con debounce
  const handleTypingChange = useCallback(
    (typing: boolean) => {
      const now = Date.now();

      // Evitar llamadas muy frecuentes
      if (now - lastTypingCallRef.current < 300) {
        return;
      }

      lastTypingCallRef.current = now;

      try {
        onTypingChange(typing);
      } catch (error) {
        console.warn("Error en onTypingChange:", error);
      }
    },
    [onTypingChange]
  );

  const handleTextChange = useCallback(
    (text: string) => {
      setMessage(text);

      // Detectar si está escribiendo
      if (text.length > 0 && !isTyping) {
        setIsTyping(true);
        handleTypingChange(true);
      } else if (text.length === 0 && isTyping) {
        setIsTyping(false);
        handleTypingChange(false);
      }

      // Limpiar timer anterior
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Solo configurar timer si hay texto
      if (text.length > 0) {
        typingTimerRef.current = setTimeout(() => {
          if (isTyping) {
            setIsTyping(false);
            handleTypingChange(false);
          }
        }, 2500) as any; // 2.5 segundos sin escribir
      }
    },
    [isTyping, handleTypingChange]
  );

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) return;

    // Enviar mensaje
    onSendMessage(trimmedMessage);

    // Limpiar input y estado de typing
    setMessage("");
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (isTyping) {
      setIsTyping(false);
      handleTypingChange(false);
    }
  }, [message, onSendMessage, isTyping, handleTypingChange]);

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="paperplane.fill"
            size={20}
            color={canSend ? "#ffffff" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f9fafb",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
  sendButtonDisabled: {
    backgroundColor: "transparent",
  },
});

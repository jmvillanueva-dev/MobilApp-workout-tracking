import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Message } from "../../domain/models/Message";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

/**
 * Componente para mostrar un mensaje individual en forma de burbuja
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      {!isCurrentUser && (
        <View style={styles.avatarContainer}>
          {message.sender_avatar ? (
            <Image
              source={{ uri: message.sender_avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {message.sender_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.sentBubble : styles.receivedBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.sentText : styles.receivedText,
          ]}
        >
          {message.content}
        </Text>

        <View style={styles.messageInfo}>
          <Text
            style={[
              styles.timeText,
              isCurrentUser ? styles.sentTimeText : styles.receivedTimeText,
            ]}
          >
            {formatTime(message.created_at)}
          </Text>

          {isCurrentUser && (
            <View style={styles.statusContainer}>
              {message.is_read ? (
                <Text style={styles.readStatus}>✓✓</Text>
              ) : (
                <Text style={styles.unreadStatus}>✓</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  sentContainer: {
    justifyContent: "flex-end",
  },
  receivedContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e1e5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: "#ffffff",
  },
  receivedText: {
    color: "#1f2937",
  },
  messageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  sentTimeText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  receivedTimeText: {
    color: "#9ca3af",
  },
  statusContainer: {
    marginLeft: 8,
  },
  readStatus: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  unreadStatus: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
});

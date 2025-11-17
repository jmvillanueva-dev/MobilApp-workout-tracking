import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Conversation } from "../../domain/models/Message";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (participantId: string) => void;
}

/**
 * Componente para mostrar una conversación individual en la lista
 */
export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Hace poco";
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      return `Hace ${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(conversation.participant_id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {conversation.participant_avatar ? (
          <Image
            source={{ uri: conversation.participant_avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {conversation.participant_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"}
            </Text>
          </View>
        )}
        {conversation.participant_role === "entrenador" && (
          <View style={styles.trainerBadge}>
            <Text style={styles.trainerBadgeText}>T</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {conversation.participant_name}
          </Text>
          <Text style={styles.time}>
            {conversation.last_message
              ? formatTime(conversation.last_message.created_at)
              : formatTime(conversation.updated_at)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              conversation.unread_count > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {conversation.last_message
              ? truncateMessage(conversation.last_message.content)
              : "Iniciar conversación..."}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unread_count > 99
                  ? "99+"
                  : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e1e5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  trainerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  trainerBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#1f2937",
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
});

import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { ChatSession } from "../types/ChatSession";

type ChatHistoryProps = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
};

export default function ChatHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: ChatHistoryProps) {
  const handleDelete = (sessionId: string, title: string) => {
    Alert.alert("Delete Chat", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => onDeleteSession(sessionId),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No chats yet. Create one from the menu!</Text>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionItem,
                currentSessionId === session.id && styles.activeSession,
              ]}
              onPress={() => onSelectSession(session.id)}
            >
              <View style={styles.sessionContent}>
                <Text
                  style={styles.sessionTitle}
                  numberOfLines={2}
                >
                  {session.title}
                </Text>
                <Text style={styles.messageCount}>
                  {session.messages.length} {session.messages.length === 1 ? "message" : "messages"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(session.id, session.title)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    paddingVertical: 12,
  },
  sessionsList: {
    flex: 1,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  activeSession: {
    backgroundColor: "#10a37f",
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 4,
  },
  messageCount: {
    color: "#aaa",
    fontSize: 12,
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#999",
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 24,
  },
});

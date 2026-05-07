import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { GROQ_API_KEY } from "@env";
import Markdown from "react-native-markdown-display";
import { useChatSession } from "./hooks/useChatSession";
import ChatHistory from "./components/ChatHistory";
import SessionSettings from "./components/SessionSettings";
import { Message } from "./types/ChatSession";

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const {
    sessions,
    currentSessionId,
    loading: sessionsLoading,
    createSession,
    deleteSession,
    switchSession,
    addMessage,
    getCurrentSession,
    updateSessionModel,
  } = useChatSession();

  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Initialize with first session or create one
  useEffect(() => {
    if (!sessionsLoading && currentSessionId === null && sessions.length === 0) {
      createSession();
    }
  }, [sessionsLoading, currentSessionId, sessions.length, createSession]);

  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  const SendMessage = async () => {
    if (!userInput.trim() || !currentSessionId || !currentSession) return;

    setMessageLoading(true);
    const userText = userInput.trim();

    // Add user message to session
    await addMessage(userText, true);
    setUserInput("");

    try {
      console.log("Sending message to Groq API...");
      console.log("API Key loaded:", GROQ_API_KEY ? "Yes" : "No");
      console.log("Model:", currentSession.model);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: currentSession.model,
          messages: messages
            .filter((m) => currentSession)
            .map((m) => ({
              role: m.user ? "user" : "assistant",
              content: m.text,
            }))
            .concat({
              role: "user",
              content: userText,
            }),
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("API Response Error:", data);
        throw new Error(`API error: ${data?.error?.message || response.statusText || "Unknown error"}`);
      }

      const text = data.choices[0]?.message?.content;

      if (!text) {
        throw new Error("No response content received from API");
      }

      await addMessage(text, false);
    } catch (error) {
      console.error("Error during AI interaction:", error);
      const errorMessage = error instanceof Error ? error.message : "Error fetching response. Please try again.";
      await addMessage(errorMessage, false);
    } finally {
      setMessageLoading(false);
    }
  };

  if (sessionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10a37f" />
        </View>
      </SafeAreaView>
    );
  }

  const handleNewChat = async () => {
    await createSession();
    setSidebarVisible(false);
  };

  const handleSelectSession = async (sessionId: string) => {
    await switchSession(sessionId);
    setSidebarVisible(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
  };

  const handleModelChange = async (model: string) => {
    if (currentSessionId) {
      await updateSessionModel(currentSessionId, model);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.user ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.user ? (
        <Text style={styles.userText}>{item.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      )}
    </View>
  );

  if (sessionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10a37f" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSidebarVisible(!sidebarVisible)}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerText} numberOfLines={1}>
            {currentSession?.title || "AI Chatbot"}
          </Text>
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          {/* Sidebar Overlay */}
          {sidebarVisible && (
            <TouchableOpacity
              style={styles.sidebarOverlay}
              onPress={() => setSidebarVisible(false)}
              activeOpacity={1}
            />
          )}

          {/* Sidebar */}
          <View
            style={[
              styles.sidebar,
              sidebarVisible ? styles.sidebarVisible : styles.sidebarHidden,
            ]}
          >
            <ChatHistory
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewChat}
              onDeleteSession={handleDeleteSession}
            />
          </View>

          {/* Chat Area */}
          <View style={styles.chatArea}>
            <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={10}
            >
              <View style={styles.messagesContainer}>
                <FlatList
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.messageList}
                  onEndReachedThreshold={0.3}
                />
                {messageLoading && (
                  <ActivityIndicator
                    size="small"
                    color="#10a37f"
                    style={styles.loading}
                  />
                )}
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Type your message..."
                  style={styles.textInput}
                  value={userInput}
                  onChangeText={setUserInput}
                  onSubmitEditing={SendMessage}
                  editable={!messageLoading}
                  multiline
                />
                <TouchableOpacity
                  onPress={SendMessage}
                  style={[
                    styles.sendButton,
                    messageLoading && styles.sendButtonDisabled,
                  ]}
                  disabled={messageLoading}
                >
                  <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </View>

      {/* Settings Modal */}
      {currentSession && (
        <SessionSettings
          visible={settingsVisible}
          currentModel={currentSession.model}
          onClose={() => setSettingsVisible(false)}
          onModelChange={handleModelChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 100,
    paddingHorizontal: 8,
    paddingVertical: 0,
    paddingTop: 40,
    backgroundColor: "#10a37f",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  menuButton: {
    padding: 4,
    marginRight: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  settingsButton: {
    padding: 6,
    marginLeft: 4,
  },
  settingsIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  sidebar: {
    width: 280,
    backgroundColor: "#1a1a1a",
    zIndex: 20,
  },
  sidebarVisible: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  sidebarHidden: {
    position: "absolute",
    left: -280,
    top: 0,
    bottom: 0,
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: "85%",
  },
  userMessage: {
    backgroundColor: "#10a37f",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
  },
  loading: {
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f5f5f5",
  },
  sendButton: {
    backgroundColor: "#10a37f",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const markdownStyles = StyleSheet.create({
  text: {
    color: "#333",
    fontSize: 15,
  },
  paragraph: {
    marginVertical: 5,
  },
  heading1: {
    fontWeight: "bold",
    fontSize: 20,
  },
  heading2: {
    fontWeight: "bold",
    fontSize: 18,
  },
  code_inline: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    borderRadius: 3,
    fontFamily: "monospace",
  },
  code_block: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 4,
    fontFamily: "monospace",
  },
});

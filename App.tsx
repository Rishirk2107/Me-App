import React, { useState } from "react";
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
} from "react-native";
import { GROQ_API_KEY, GROQ_MODEL } from "@env";
import Markdown from "react-native-markdown-display";

type Message = {
  text: string;
  user: boolean;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");

  const SendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    const userMessage: Message = { text: userInput.trim(), user: true };

    setMessages((prev) => [...prev, userMessage]);

    try {
      console.log("Sending message to Groq API...");
      console.log("API Key loaded:", GROQ_API_KEY ? "Yes" : "No");
      console.log("Model:", GROQ_MODEL || "llama-3.1-8b-instant");

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL || "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: userMessage.text,
            },
          ],
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

      setMessages((prev) => [...prev, { text, user: false }]);
    } catch (error) {
      console.error("Error during AI interaction:", error);
      const errorMessage = error instanceof Error ? error.message : "Error fetching response. Please try again.";
      setMessages((prev) => [
        ...prev,
        { text: errorMessage, user: false },
      ]);
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.user ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={item.user ? styles.userText : styles.aiText}>
        {item.user ? item.text : <Markdown>{item.text}</Markdown>}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>AI Chatbot</Text>
          </View>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messageList}
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color="#6200ee"
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
          />
          <TouchableOpacity onPress={SendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edf2f7",
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: "#00796b",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    paddingBlock: 10,
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 20,
    maxWidth: "85%",
  },
  userMessage: {
    backgroundColor: "#e0f7fa",
    alignSelf: "flex-end",
  },
  aiMessage: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderColor: "#ddd",
    borderWidth: 1,
  },
  userText: {
    color: "#00796b",
    fontSize: 15,
  },
  aiText: {
    color: "#333",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#00796b",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

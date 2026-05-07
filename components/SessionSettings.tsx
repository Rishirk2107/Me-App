import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { AVAILABLE_MODELS } from "../types/ChatSession";

type SessionSettingsProps = {
  visible: boolean;
  currentModel: string;
  onClose: () => void;
  onModelChange: (model: string) => void;
};

export default function SessionSettings({
  visible,
  currentModel,
  onClose,
  onModelChange,
}: SessionSettingsProps) {
  const handleModelSelect = (model: string) => {
    onModelChange(model);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Model</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Model List */}
          <ScrollView style={styles.modelList}>
            {AVAILABLE_MODELS.map((model) => (
              <TouchableOpacity
                key={model}
                style={[
                  styles.modelOption,
                  currentModel === model && styles.modelOptionActive,
                ]}
                onPress={() => handleModelSelect(model)}
              >
                <View style={styles.modelContent}>
                  <Text
                    style={[
                      styles.modelName,
                      currentModel === model && styles.modelNameActive,
                    ]}
                  >
                    {model}
                  </Text>
                  {currentModel === model && (
                    <Text style={styles.selectedBadge}>✓ Selected</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#999",
    lineHeight: 28,
  },
  modelList: {
    paddingVertical: 8,
  },
  modelOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modelOptionActive: {
    backgroundColor: "#f0f7ff",
  },
  modelContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modelName: {
    fontSize: 15,
    color: "#666",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  modelNameActive: {
    color: "#10a37f",
    fontWeight: "600",
  },
  selectedBadge: {
    fontSize: 13,
    color: "#10a37f",
    fontWeight: "600",
  },
});

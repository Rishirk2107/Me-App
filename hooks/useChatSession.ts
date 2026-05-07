import { useState, useEffect, useCallback } from "react";
import storage from "../utils/storage";
import { ChatSession, Message, AVAILABLE_MODELS } from "../types/ChatSession";

const SESSIONS_KEY = "chat_sessions";
const CURRENT_SESSION_KEY = "current_session_id";
const DEFAULT_MODEL = AVAILABLE_MODELS[0];

export function useChatSession() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all sessions from storage
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const [sessionsJson, lastSessionId] = await Promise.all([
        storage.getItem(SESSIONS_KEY),
        storage.getItem(CURRENT_SESSION_KEY),
      ]);

      const loadedSessions = sessionsJson ? JSON.parse(sessionsJson) : [];
      setSessions(loadedSessions);

      if (lastSessionId && loadedSessions.some((s: ChatSession) => s.id === lastSessionId)) {
        setCurrentSessionId(lastSessionId);
      } else if (loadedSessions.length > 0) {
        setCurrentSessionId(loadedSessions[0].id);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save sessions to storage
  const saveSessions = useCallback(async (updatedSessions: ChatSession[]) => {
    try {
      await storage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error saving sessions:", error);
    }
  }, []);

  // Save current session ID
  const saveCurrentSessionId = useCallback(async (id: string | null) => {
    try {
      if (id) {
        await storage.setItem(CURRENT_SESSION_KEY, id);
      } else {
        await storage.removeItem(CURRENT_SESSION_KEY);
      }
      setCurrentSessionId(id);
    } catch (error) {
      console.error("Error saving current session ID:", error);
    }
  }, []);

  // Create new session
  const createSession = useCallback(
    async (title?: string, model?: string) => {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: title || `Chat ${new Date().toLocaleDateString()}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: model || DEFAULT_MODEL,
      };

      const updatedSessions = [newSession, ...sessions];
      await saveSessions(updatedSessions);
      await saveCurrentSessionId(newSession.id);
      return newSession;
    },
    [sessions, saveSessions, saveCurrentSessionId]
  );

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: string) => {
      const filtered = sessions.filter((s) => s.id !== sessionId);
      await saveSessions(filtered);

      if (currentSessionId === sessionId) {
        const nextId = filtered.length > 0 ? filtered[0].id : null;
        await saveCurrentSessionId(nextId);
      }
    },
    [sessions, currentSessionId, saveSessions, saveCurrentSessionId]
  );

  // Switch to session
  const switchSession = useCallback(
    async (sessionId: string) => {
      await saveCurrentSessionId(sessionId);
    },
    [saveCurrentSessionId]
  );

  // Add message to current session
  const addMessage = useCallback(
    async (text: string, isUserMessage: boolean) => {
      if (!currentSessionId) return null;

      const message: Message = {
        id: `msg_${Date.now()}`,
        text,
        user: isUserMessage,
        timestamp: Date.now(),
      };

      const updatedSessions = sessions.map((session) => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, message],
            updatedAt: Date.now(),
          };
        }
        return session;
      });

      await saveSessions(updatedSessions);
      return message;
    },
    [currentSessionId, sessions, saveSessions]
  );

  // Get current session
  const getCurrentSession = useCallback(() => {
    return sessions.find((s) => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Update session title
  const updateSessionTitle = useCallback(
    async (sessionId: string, newTitle: string) => {
      const updatedSessions = sessions.map((session) => {
        if (session.id === sessionId) {
          return { ...session, title: newTitle, updatedAt: Date.now() };
        }
        return session;
      });

      await saveSessions(updatedSessions);
    },
    [sessions, saveSessions]
  );

  // Update session model
  const updateSessionModel = useCallback(
    async (sessionId: string, newModel: string) => {
      const updatedSessions = sessions.map((session) => {
        if (session.id === sessionId) {
          return { ...session, model: newModel, updatedAt: Date.now() };
        }
        return session;
      });

      await saveSessions(updatedSessions);
    },
    [sessions, saveSessions]
  );

  // Clear all sessions
  const clearAllSessions = useCallback(async () => {
    await saveSessions([]);
    await saveCurrentSessionId(null);
  }, [saveSessions, saveCurrentSessionId]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSessionId,
    loading,
    createSession,
    deleteSession,
    switchSession,
    addMessage,
    getCurrentSession,
    updateSessionTitle,
    updateSessionModel,
    clearAllSessions,
    loadSessions,
  };
}

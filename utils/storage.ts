import * as SQLite from "expo-sqlite";

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let db: SQLite.SQLiteDatabase | null = null;
let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  try {
    db = await SQLite.openDatabaseAsync("chat_storage.db");

    // Create table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    initialized = true;
    console.log("SQLite database initialized successfully");
  } catch (error) {
    console.error("Error initializing SQLite database:", error);
  }
}

const storage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      await initializeDatabase();

      if (!db) {
        console.warn("Database not initialized");
        return null;
      }

      const result = await db.getFirstAsync<{ value: string }>(
        "SELECT value FROM storage WHERE key = ?",
        [key]
      );

      return result?.value || null;
    } catch (error) {
      console.error(`Error getting item from storage (${key}):`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await initializeDatabase();

      if (!db) {
        console.warn("Database not initialized");
        return;
      }

      await db.runAsync(
        "INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)",
        [key, value]
      );
    } catch (error) {
      console.error(`Error setting item in storage (${key}):`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await initializeDatabase();

      if (!db) {
        console.warn("Database not initialized");
        return;
      }

      await db.runAsync("DELETE FROM storage WHERE key = ?", [key]);
    } catch (error) {
      console.error(`Error removing item from storage (${key}):`, error);
    }
  },
};

export default storage;


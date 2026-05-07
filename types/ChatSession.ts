export type Message = {
  id: string;
  text: string;
  user: boolean;
  timestamp: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
};

export const AVAILABLE_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
];

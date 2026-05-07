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
};

import { BaseService } from "./base.service";

export interface ChatMessage {
  senderType: "User" | "AI";
  content: string;
  sentAt: string;
}

export interface ConversationItem {
  convId: number;
  docId: number;
  docTitle: string;
  lastMessage: string;
  startTime: string;
}

class ChatService extends BaseService {
  constructor() {
    super("/api/chat");
  }

  getConversations(): Promise<ConversationItem[]> {
    return this.get("/conversations");
  }

  getConversationMessages(convId: number): Promise<ChatMessage[]> {
    return this.get(`/conversations/${convId}`);
  }

  getHistory(docId: number): Promise<ChatMessage[]> {
    return this.get(`/history/${docId}`);
  }

  async *askStream(question: string, docId: number, convId?: number): AsyncGenerator<string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5292"}/api/chat/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question, docId, convId }),
      },
    );
    if (!res.ok || !res.body) throw new Error("Lỗi kết nối");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ")) yield line.slice(6);
      }
    }
  }
}

export const chatService = new ChatService();

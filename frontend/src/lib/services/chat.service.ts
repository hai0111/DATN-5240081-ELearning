import { BaseService } from './base.service';

export interface ChatMessage {
  senderType: 'User' | 'AI';
  content: string;
  sentAt: string;
  docIds: number[];
}

export interface ConversationItem {
  convId: number;
  title: string;
  lastMessage: string;
  startTime: string;
}

class ChatService extends BaseService {
  constructor() {
    super('/api/chat');
  }

  getConversations(): Promise<ConversationItem[]> {
    return this.get('/conversations');
  }

  getConversationMessages(convId: number): Promise<ChatMessage[]> {
    return this.get(`/conversations/${convId}`);
  }

  async *askStream(
    question: string,
    docIds: number[],
    convId?: number,
  ): AsyncGenerator<{ type: 'conv'; convId: number } | { type: 'chunk'; text: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5292'}/api/chat/ask`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question, docIds, convId }),
      },
    );
    if (!res.ok || !res.body) throw new Error('Lỗi kết nối');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let eventName = '';
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventName = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (eventName === 'conv') {
            yield { type: 'conv', convId: Number(data) };
          } else {
            yield { type: 'chunk', text: data };
          }
          eventName = '';
        }
      }
    }
  }
}

export const chatService = new ChatService();

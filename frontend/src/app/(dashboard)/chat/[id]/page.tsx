'use client';
import ChatPanel from '@/components/ChatPanel';

// /chat/[id] now opens a new chat (id is unused, kept for routing compat)
export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">
      <ChatPanel fullPage defaultView="chat" />
    </div>
  );
}

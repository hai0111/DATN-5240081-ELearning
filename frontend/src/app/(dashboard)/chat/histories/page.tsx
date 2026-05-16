'use client';
import ChatPanel from '@/components/ChatPanel';

export default function ChatHistoriesPage() {
  return (
    <div className="flex h-screen flex-col">
      <ChatPanel fullPage defaultView="history" />
    </div>
  );
}

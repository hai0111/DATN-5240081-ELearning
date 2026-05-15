'use client';
import ChatPanel from '@/components/ChatPanel';

export default function ChatHistoriesPage() {
  return (
    <div className="flex h-screen flex-col">
      <ChatPanel docId={null} fullPage defaultView="history" />
    </div>
  );
}

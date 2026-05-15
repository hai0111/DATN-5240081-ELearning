'use client';
import { use } from 'react';
import ChatPanel from '@/components/ChatPanel';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="flex h-screen flex-col">
      <ChatPanel docId={Number(id)} fullPage />
    </div>
  );
}

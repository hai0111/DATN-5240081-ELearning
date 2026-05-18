'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { Bot, File, FileText, MoreHorizontal } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { fileIconColor } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import ChatPanel from '@/components/ChatPanel';
import TiptapEditor from '@/components/TiptapEditor';

export default function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getDoc } = useDocuments();
  const doc = getDoc(id);
  if (!doc) notFound();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-border flex h-12 flex-shrink-0 items-center justify-between border-b px-6">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>DocAI</span>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs">{doc.name}</span>
          </div>
          <Button
            variant={chatOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatOpen((v) => !v)}
          >
            <Bot className="h-3.5 w-3.5" /> AI Chat
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-10">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {doc.type === 'file' ? (
                  <File className={`h-8 w-8 ${fileIconColor(doc.fileType)}`} />
                ) : (
                  <FileText className="text-muted-foreground h-8 w-8" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{doc.name}</h1>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {doc.type === 'file' ? doc.fileType : 'Văn bản'} · {doc.createdAt}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {doc.type === 'text' ? (
              <TiptapEditor />
            ) : (
              <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-lg border p-8">
                <File className="h-12 w-12" />
                <p className="text-sm">Xem trước tệp {doc.fileType}</p>
                <Button size="sm">Mở tệp</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {chatOpen && (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          expanded={chatExpanded}
          onToggleExpand={() => setChatExpanded((v) => !v)}
        />
      )}
    </div>
  );
}

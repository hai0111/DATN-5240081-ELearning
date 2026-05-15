'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Bot, Plus, FileText, File } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { NAV_LABELS, fileIconColor, type NavId } from '@/lib/constants';
import NewDocModal from '@/components/NewDocModal';
import ChatPanel from '@/components/ChatPanel';

const VALID_NAVS = ['all', 'file', 'text', 'trash'];

export default function NavPage({ params }: { params: Promise<{ nav: string }> }) {
  const { nav } = use(params);
  if (!VALID_NAVS.includes(nav)) notFound();

  const { filterDocs, addDoc } = useDocuments();
  const [search, setSearch] = useState('');
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  const filtered = filterDocs(nav, search);

  const handleCreated = (doc: { type: 'file'; file: File } | { type: 'text'; name: string }) => {
    addDoc(doc);
    setNewDocOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-border flex h-12 flex-shrink-0 items-center justify-between border-b px-6">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>DocAI</span>
            <span>/</span>
            <span className="text-foreground font-medium">{NAV_LABELS[nav as NavId]}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen((v) => !v)}
              className={`flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-opacity hover:opacity-90 ${chatOpen ? 'bg-foreground text-background' : 'border border-border text-foreground'}`}
            >
              <Bot className="h-3.5 w-3.5" /> AI Chat
            </button>
            <button
              onClick={() => setNewDocOpen(true)}
              className="bg-foreground text-background flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm mới
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-muted-foreground mb-4 text-sm font-semibold">{filtered.length} tài liệu</p>

          {filtered.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
              <FileText className="h-10 w-10" />
              <p className="text-sm">Chưa có tài liệu nào</p>
              <button
                onClick={() => setNewDocOpen(true)}
                className="bg-foreground text-background h-8 rounded-md px-4 text-sm font-medium hover:opacity-90"
              >
                Thêm tài liệu đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/doc/${doc.id}`}
                  className="group border-border hover:border-foreground/20 hover:bg-muted/40 relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 transition-all"
                >
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                    {doc.type === 'file' ? (
                      <File className={`h-4 w-4 ${fileIconColor(doc.fileType)}`} />
                    ) : (
                      <FileText className="text-muted-foreground h-4 w-4" />
                    )}
                  </div>
                  <div className="w-full">
                    <p className="line-clamp-2 text-sm leading-tight font-medium">{doc.name}</p>
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {doc.type === 'file' ? doc.fileType : 'Văn bản'} · {doc.createdAt}
                    </p>
                  </div>
                </Link>
              ))}

              <button
                onClick={() => setNewDocOpen(true)}
                className="border-border hover:border-foreground/30 hover:bg-muted/30 text-muted-foreground flex h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm">Thêm mới</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {chatOpen && (
        <ChatPanel
          docId={null}
          onClose={() => setChatOpen(false)}
          expanded={chatExpanded}
          onToggleExpand={() => setChatExpanded((v) => !v)}
        />
      )}

      <NewDocModal open={newDocOpen} onClose={() => setNewDocOpen(false)} onCreated={handleCreated} />
    </div>
  );
}

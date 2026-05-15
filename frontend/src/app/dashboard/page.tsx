'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  FileText,
  File,
  Plus,
  Search,
  ChevronDown,
  LayoutDashboard,
  Trash2,
  MoreHorizontal,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import NewDocModal from '@/components/NewDocModal';
import ProfileModal from '@/components/ProfileModal';
import ChatPanel from '@/components/ChatPanel';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

type DocItem = {
  id: string;
  name: string;
  type: 'file' | 'text';
  fileType?: string;
  createdAt: string;
};

const MOCK_DOCS: DocItem[] = [
  { id: '1', name: 'Báo cáo Q1 2026', type: 'file', fileType: 'PDF', createdAt: '2026-05-10' },
  { id: '2', name: 'Hợp đồng lao động', type: 'file', fileType: 'DOCX', createdAt: '2026-05-12' },
  { id: '3', name: 'Ghi chú họp nhóm', type: 'text', createdAt: '2026-05-14' },
  { id: '4', name: 'Kế hoạch dự án', type: 'text', createdAt: '2026-05-15' },
  { id: '5', name: 'Tài liệu kỹ thuật', type: 'file', fileType: 'PDF', createdAt: '2026-05-15' },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tất cả tài liệu', id: 'all' },
  { icon: File, label: 'Tệp tin', id: 'file' },
  { icon: FileText, label: 'Văn bản', id: 'text' },
  { icon: Trash2, label: 'Thùng rác', id: 'trash' },
];

function fileIcon(type?: string) {
  const colors: Record<string, string> = {
    PDF: 'text-red-500',
    DOCX: 'text-blue-500',
    TXT: 'text-gray-500',
  };
  return colors[type ?? ''] ?? 'text-muted-foreground';
}

export default function Dashboard() {
  const { user, ready } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [docs, setDocs] = useState<DocItem[]>(MOCK_DOCS);
  const [activeNav, setActiveNav] = useState('all');
  const [search, setSearch] = useState('');
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) return null;

  const filtered = docs.filter((d) => {
    const matchNav = activeNav === 'all' || d.type === activeNav;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchNav && matchSearch;
  });

  const handleCreated = (doc: { type: 'file'; file: File } | { type: 'text'; name: string }) => {
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: doc.type === 'file' ? doc.file.name : doc.name,
      type: doc.type,
      fileType: doc.type === 'file' ? doc.file.name.split('.').pop()?.toUpperCase() : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDocs((prev) => [newDoc, ...prev]);
    setActiveDoc(newDoc.id);
  };

  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocs((prev) => prev.filter((d) => d.id !== id));
    if (activeDoc === id) setActiveDoc(null);
  };

  const activeDocData = docs.find((d) => d.id === activeDoc);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="border-border bg-sidebar flex w-60 flex-shrink-0 flex-col border-r">
        {/* Workspace header */}
        <div className="border-border flex items-center gap-2 border-b px-3 py-3">
          <div className="bg-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded">
            <FileText className="text-background h-3.5 w-3.5" />
          </div>
          <span className="flex-1 truncate text-sm font-semibold">DocAI</span>
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5 flex-shrink-0" />
        </div>

        {/* Search */}
        <div className="px-2 py-2">
          <div className="bg-muted/50 text-muted-foreground flex h-7 items-center gap-2 rounded-md px-2 text-sm">
            <Search className="h-3.5 w-3.5 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors ${
                activeNav === id
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Divider + New doc */}
        <div className="mt-3 mb-1 px-2">
          <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase">
            Tài liệu
          </p>
          <button
            onClick={() => setNewDocOpen(true)}
            className="text-muted-foreground hover:bg-accent/50 hover:text-foreground flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm mới
          </button>
        </div>

        {/* Doc list in sidebar */}
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {docs.slice(0, 10).map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`group flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors ${
                activeDoc === doc.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              {doc.type === 'file' ? (
                <File className={`h-3.5 w-3.5 flex-shrink-0 ${fileIcon(doc.fileType)}`} />
              ) : (
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span className="flex-1 truncate text-left">{doc.name}</span>
            </button>
          ))}
        </div>

        {/* User footer */}
        <div className="border-border border-t p-2">
          <div className="hover:bg-accent/50 flex h-8 items-center gap-2 rounded-md px-2 transition-colors">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <div className="bg-muted flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <User className="text-muted-foreground h-3 w-3" />
              </div>
              <span className="truncate text-sm">{user?.fullName ?? 'Người dùng'}</span>
            </button>
            <button
              onClick={toggle}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              {theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5" />
              ) : (
                <Sun className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-border flex h-12 flex-shrink-0 items-center justify-between border-b px-6">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <span>DocAI</span>
            <span>/</span>
            <span className="text-foreground font-medium">
              {activeNav === 'all'
                ? 'Tất cả tài liệu'
                : activeNav === 'file'
                  ? 'Tệp tin'
                  : activeNav === 'text'
                    ? 'Văn bản'
                    : 'Thùng rác'}
            </span>
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

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {activeDocData ? (
            /* ── Document view ── */
            <div className="mx-auto max-w-3xl px-8 py-10">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {activeDocData.type === 'file' ? (
                    <File className={`h-8 w-8 ${fileIcon(activeDocData.fileType)}`} />
                  ) : (
                    <FileText className="text-muted-foreground h-8 w-8" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{activeDocData.name}</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {activeDocData.type === 'file' ? activeDocData.fileType : 'Văn bản'} ·{' '}
                      {activeDocData.createdAt}
                    </p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground p-1">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {activeDocData.type === 'text' ? (
                <textarea
                  placeholder="Bắt đầu viết nội dung..."
                  className="placeholder:text-muted-foreground/50 min-h-[400px] w-full resize-none bg-transparent text-sm leading-7 outline-none"
                />
              ) : (
                <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-lg border p-8">
                  <File className="h-12 w-12" />
                  <p className="text-sm">Xem trước tệp {activeDocData.fileType}</p>
                  <button className="bg-foreground text-background h-8 rounded-md px-4 text-sm font-medium hover:opacity-90">
                    Mở tệp
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Grid view ── */
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-muted-foreground text-sm font-semibold">
                  {filtered.length} tài liệu
                </h2>
              </div>

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
                    <div
                      key={doc.id}
                      onClick={() => setActiveDoc(doc.id)}
                      className="group border-border hover:border-foreground/20 hover:bg-muted/40 relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 transition-all"
                    >
                      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                        {doc.type === 'file' ? (
                          <File className={`h-4 w-4 ${fileIcon(doc.fileType)}`} />
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

                      <button
                        onClick={(e) => deleteDoc(doc.id, e)}
                        className="text-muted-foreground hover:text-destructive absolute top-2 right-2 opacity-0 transition-all group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
          )}
        </div>
      </main>

      {chatOpen && (
        <ChatPanel
          docId={activeDoc != null ? Number(activeDoc) : null}
          onClose={() => setChatOpen(false)}
          expanded={chatExpanded}
          onToggleExpand={() => setChatExpanded((v) => !v)}
        />
      )}

      <NewDocModal
        open={newDocOpen}
        onClose={() => setNewDocOpen(false)}
        onCreated={handleCreated}
      />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, ChevronDown, Search, Plus, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { NAV_ITEMS } from '@/lib/constants';
import { useDocuments } from '@/hooks/useDocuments';
import NewDocModal from '@/components/NewDocModal';
import ProfileModal from '@/components/ProfileModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { docs, addDoc } = useDocuments();
  const [search, setSearch] = useState('');
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!ready || !user) return null;

  const handleCreated = (doc: { type: 'file'; file: File } | { type: 'text'; name: string }) => {
    const newDoc = addDoc(doc);
    router.push(`/doc/${newDoc.id}`);
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
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
          {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
    const href = `/${id}`;
            const active = pathname === href;
            return (
              <Link
                key={id}
                href={href}
                className={`flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors ${
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Doc list */}
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

        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {docs.slice(0, 10).map((doc) => {
            const href = `/doc/${doc.id}`;
            const active = pathname === href;
            return (
              <Link
                key={doc.id}
                href={href}
                className={`group flex h-7 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors ${
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate text-left">{doc.name}</span>
              </Link>
            );
          })}
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
            <button onClick={toggle} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>

      <NewDocModal open={newDocOpen} onClose={() => setNewDocOpen(false)} onCreated={handleCreated} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

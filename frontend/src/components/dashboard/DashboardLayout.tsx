'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, ChevronDown, Search, Plus, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { NAV_ITEMS } from '@/lib/constants';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-7 pl-7 text-sm"
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
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setNewDocOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Thêm mới
          </Button>
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
          <div className="flex h-8 items-center gap-1">
            <Button variant="ghost" size="sm" className="min-w-0 flex-1 justify-start gap-2 px-2"
              onClick={() => setProfileOpen(true)}>
              <div className="bg-muted flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                <User className="text-muted-foreground h-3 w-3" />
              </div>
              <span className="truncate text-sm">{user?.fullName ?? 'Người dùng'}</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={toggle}>
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>

      <NewDocModal open={newDocOpen} onClose={() => setNewDocOpen(false)} onCreated={handleCreated} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hồ sơ cá nhân</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} className="h-full w-full rounded-full object-cover" alt="" />
              : <User className="text-muted-foreground h-6 w-6" />}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-sm font-medium uppercase tracking-wide">Họ tên</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="text-muted-foreground mb-1.5 block text-sm font-medium uppercase tracking-wide">Email</label>
            <Input value={user?.email ?? ''} readOnly disabled />
          </div>
          <Button className="w-full" onClick={handleSave}>{saved ? 'Đã lưu ✓' : 'Lưu thay đổi'}</Button>

          <div className="border-border space-y-2 border-t pt-4">
            <Button variant="ghost" className="w-full justify-between" onClick={toggle}>
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Giao diện {theme === 'dark' ? 'tối' : 'sáng'}
              </span>
              <div className={`relative h-5 w-9 rounded-full transition-colors ${theme === 'dark' ? 'bg-foreground' : 'bg-muted-foreground/30'}`}>
                <div className={`bg-background absolute top-0.5 h-4 w-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </Button>
            <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

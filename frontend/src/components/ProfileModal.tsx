'use client';
import { useState } from 'react';
import { X, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useRouter } from 'next/navigation';

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

  if (!open) return null;

  const handleSave = () => {
    // TODO: call PATCH /api/users/me
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border-border w-full max-w-sm rounded-xl border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">Hồ sơ cá nhân</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="h-full w-full rounded-full object-cover"
                alt=""
              />
            ) : (
              <User className="text-muted-foreground h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Tên */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-sm font-medium tracking-wide uppercase">
              Họ tên
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-input bg-background focus:ring-ring h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-sm font-medium tracking-wide uppercase">
              Email
            </label>
            <input
              value={user?.email ?? ''}
              readOnly
              className="border-input bg-muted text-muted-foreground h-9 w-full cursor-not-allowed rounded-md border px-3 text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-foreground text-background h-9 w-full rounded-md text-sm font-medium transition-opacity hover:opacity-90"
          >
            {saved ? 'Đã lưu ✓' : 'Lưu thay đổi'}
          </button>

          {/* Divider */}
          <div className="border-border space-y-2 border-t pt-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="hover:bg-muted flex h-9 w-full items-center justify-between rounded-md px-3 text-sm transition-colors"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Giao diện {theme === 'dark' ? 'tối' : 'sáng'}
              </span>
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${theme === 'dark' ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
              >
                <div
                  className={`bg-background absolute top-0.5 h-4 w-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hover:bg-destructive/10 text-destructive flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

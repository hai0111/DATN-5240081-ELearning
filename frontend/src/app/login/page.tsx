"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, FileText } from "lucide-react";

export default function LoginPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5292"}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Thông tin đăng nhập không chính xác");
      const data = await res.json();
      login(data.user, data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-background" />
          </div>
          <span className="text-xl font-semibold tracking-tight">DocAI</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-semibold mb-1">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground mb-6">Nhập thông tin tài khoản của bạn</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-9 px-3 pr-9 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

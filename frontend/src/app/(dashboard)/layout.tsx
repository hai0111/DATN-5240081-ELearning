import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DocsProvider } from '@/hooks/useDocuments';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DocsProvider>
  );
}

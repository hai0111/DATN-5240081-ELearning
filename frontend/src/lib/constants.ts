import { LayoutDashboard, File, FileText, Trash2 } from 'lucide-react';

export const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Tất cả tài liệu', id: 'all' },
  { icon: File, label: 'Tệp tin', id: 'file' },
  { icon: FileText, label: 'Văn bản', id: 'text' },
  { icon: Trash2, label: 'Thùng rác', id: 'trash' },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]['id'];

export const NAV_LABELS: Record<NavId, string> = {
  all: 'Tất cả tài liệu',
  file: 'Tệp tin',
  text: 'Văn bản',
  trash: 'Thùng rác',
};

export const FILE_COLORS: Record<string, string> = {
  PDF: 'text-red-500',
  DOCX: 'text-blue-500',
  TXT: 'text-gray-500',
};

export function fileIconColor(type?: string) {
  return FILE_COLORS[type ?? ''] ?? 'text-muted-foreground';
}

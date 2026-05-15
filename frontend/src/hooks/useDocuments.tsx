'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

export type DocItem = {
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

type DocsContextValue = {
  docs: DocItem[];
  addDoc: (doc: { type: 'file'; file: File } | { type: 'text'; name: string }) => DocItem;
  deleteDoc: (id: string) => void;
  getDoc: (id: string) => DocItem | undefined;
  filterDocs: (nav: string, search: string) => DocItem[];
};

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<DocItem[]>(MOCK_DOCS);

  const addDoc = (doc: { type: 'file'; file: File } | { type: 'text'; name: string }): DocItem => {
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: doc.type === 'file' ? doc.file.name : doc.name,
      type: doc.type,
      fileType: doc.type === 'file' ? doc.file.name.split('.').pop()?.toUpperCase() : undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDocs((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));
  const getDoc = (id: string) => docs.find((d) => d.id === id);
  const filterDocs = (nav: string, search: string) =>
    docs.filter((d) => {
      const matchNav = nav === 'all' || d.type === nav;
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      return matchNav && matchSearch;
    });

  return (
    <DocsContext.Provider value={{ docs, addDoc, deleteDoc, getDoc, filterDocs }}>
      {children}
    </DocsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error('useDocuments must be used within DocsProvider');
  return ctx;
}

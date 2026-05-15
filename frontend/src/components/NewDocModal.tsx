'use client';
import { useState, useRef } from 'react';
import { FileText, Upload, X, File } from 'lucide-react';

type DocType = 'file' | 'text' | null;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (doc: { type: 'file'; file: File } | { type: 'text'; name: string }) => void;
}

export default function NewDocModal({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<DocType>(null);
  const [textName, setTextName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setStep(null);
    setTextName('');
    onClose();
  };

  const handleFile = (file: File) => {
    onCreated({ type: 'file', file });
    reset();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={reset}
    >
      <div
        className="bg-card border-border w-full max-w-md rounded-xl border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {step === null
              ? 'Thêm tài liệu mới'
              : step === 'file'
                ? 'Tải lên tệp tin'
                : 'Tạo văn bản'}
          </h2>
          <button onClick={reset} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: chọn loại */}
        {step === null && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep('file')}
              className="border-border hover:border-foreground/30 hover:bg-muted/50 flex flex-col items-center gap-3 rounded-lg border p-5 transition-colors"
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Tệp tin</p>
                <p className="text-muted-foreground mt-0.5 text-sm">PDF, DOCX, TXT</p>
              </div>
            </button>

            <button
              onClick={() => setStep('text')}
              className="border-border hover:border-foreground/30 hover:bg-muted/50 flex flex-col items-center gap-3 rounded-lg border p-5 transition-colors"
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Văn bản</p>
                <p className="text-muted-foreground mt-0.5 text-sm">Tạo tài liệu mới</p>
              </div>
            </button>
          </div>
        )}

        {/* Step 2a: upload file */}
        {step === 'file' && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors ${
                dragOver
                  ? 'border-foreground bg-muted/50'
                  : 'border-border hover:border-foreground/40 hover:bg-muted/30'
              }`}
            >
              <File className="text-muted-foreground h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Kéo thả hoặc nhấn để chọn</p>
                <p className="text-muted-foreground mt-1 text-sm">PDF, DOCX, TXT — tối đa 20MB</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <button
              onClick={() => setStep(null)}
              className="text-muted-foreground hover:text-foreground mt-3 text-sm"
            >
              ← Quay lại
            </button>
          </div>
        )}

        {/* Step 2b: đặt tên văn bản */}
        {step === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tên tài liệu</label>
              <input
                autoFocus
                type="text"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textName.trim()) {
                    onCreated({ type: 'text', name: textName.trim() });
                    reset();
                  }
                }}
                placeholder="Nhập tên tài liệu..."
                className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(null)}
                className="border-border hover:bg-muted h-9 flex-1 rounded-md border text-sm transition-colors"
              >
                Quay lại
              </button>
              <button
                disabled={!textName.trim()}
                onClick={() => {
                  onCreated({ type: 'text', name: textName.trim() });
                  reset();
                }}
                className="bg-foreground text-background h-9 flex-1 rounded-md text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Tạo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

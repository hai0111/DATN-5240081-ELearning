'use client';
import { useState, useRef } from 'react';
import { FileText, Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const reset = () => { setStep(null); setTextName(''); onClose(); };

  const handleFile = (file: File) => { onCreated({ type: 'file', file }); reset(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === null ? 'Thêm tài liệu mới' : step === 'file' ? 'Tải lên tệp tin' : 'Tạo văn bản'}
          </DialogTitle>
        </DialogHeader>

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

        {step === 'file' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors ${
                dragOver ? 'border-foreground bg-muted/50' : 'border-border hover:border-foreground/40 hover:bg-muted/30'
              }`}
            >
              <File className="text-muted-foreground h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Kéo thả hoặc nhấn để chọn</p>
                <p className="text-muted-foreground mt-1 text-sm">PDF, DOCX, TXT — tối đa 20MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Button variant="ghost" size="sm" onClick={() => setStep(null)} className="mt-3">
              ← Quay lại
            </Button>
          </div>
        )}

        {step === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tên tài liệu</label>
              <Input
                autoFocus
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textName.trim()) { onCreated({ type: 'text', name: textName.trim() }); reset(); }
                }}
                placeholder="Nhập tên tài liệu..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(null)}>Quay lại</Button>
              <Button className="flex-1" disabled={!textName.trim()}
                onClick={() => { onCreated({ type: 'text', name: textName.trim() }); reset(); }}>
                Tạo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

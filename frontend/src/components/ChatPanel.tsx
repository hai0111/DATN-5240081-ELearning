"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, ChevronLeft, Maximize2, Plus, Send, X } from "lucide-react";
import { chatService, type ChatMessage, type ConversationItem } from "@/lib/services/chat.service";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";

interface DocOption {
  docId: number;
  title: string;
}

interface Props {
  onClose?: () => void;
  fullPage?: boolean;
  defaultView?: "chat" | "history";
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;

export default function ChatPanel({ onClose, fullPage, defaultView }: Props) {
  const router = useRouter();
  const { docs: rawDocs } = useDocuments();
  const docs: DocOption[] = rawDocs.map((d) => ({ docId: Number(d.id), title: d.name }));
  const [view, setView] = useState<"history" | "chat">(defaultView ?? "chat");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionedDocs, setMentionedDocs] = useState<DocOption[]>([]);

  // Resize state
  const [width, setWidth] = useState(320);
  const [isFullOverlay, setIsFullOverlay] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.getConversations().then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if content area is too narrow → full overlay
  useEffect(() => {
    if (fullPage) return;
    const check = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const parent = panel.parentElement;
      if (!parent) return;
      const contentWidth = parent.offsetWidth - width;
      setIsFullOverlay(contentWidth < 480);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [width, fullPage]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [width]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = startX.current - e.clientX; // drag left = wider
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
    setWidth(next);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const pickConversation = async (conv: ConversationItem) => {
    setActiveConvId(conv.convId);
    setMessages([]);
    setView("chat");
    const msgs = await chatService.getConversationMessages(conv.convId).catch(() => []);
    setMessages(msgs);
  };

  const newChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setMentionedDocs([]);
    setView("chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const cursor = e.target.selectionStart ?? val.length;
    const atMatch = val.slice(0, cursor).match(/@(\w*)$/);
    setMentionQuery(atMatch ? atMatch[1].toLowerCase() : null);
  };

  const filteredDocs = mentionQuery !== null
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(mentionQuery) &&
          !mentionedDocs.some((m) => m.docId === d.docId),
      )
    : [];

  const selectMention = (doc: DocOption) => {
    const cursor = textareaRef.current?.selectionStart ?? input.length;
    const before = input.slice(0, cursor).replace(/@\w*$/, `@${doc.title} `);
    setInput(before + input.slice(cursor));
    setMentionQuery(null);
    setMentionedDocs((prev) => [...prev, doc]);
    textareaRef.current?.focus();
  };

  const removeMention = (docId: number) =>
    setMentionedDocs((prev) => prev.filter((d) => d.docId !== docId));

  const send = async () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput("");
    setMentionQuery(null);
    const docIds = mentionedDocs.map((d) => d.docId);
    setMessages((prev) => [...prev, { senderType: "User", content: q, sentAt: new Date().toISOString(), docIds }]);
    setStreaming(true);
    setMessages((prev) => [...prev, { senderType: "AI", content: "", sentAt: new Date().toISOString(), docIds: [] }]);

    let aiContent = "";
    try {
      for await (const event of chatService.askStream(q, docIds, activeConvId ?? undefined)) {
        if (event.type === "conv") {
          setActiveConvId(event.convId);
        } else {
          aiContent += event.text;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: aiContent };
            return next;
          });
        }
      }
      chatService.getConversations().then(setConversations).catch(() => {});
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: "Đã có lỗi xảy ra." };
        return next;
      });
    } finally {
      setStreaming(false);
      setMentionedDocs([]);
    }
  };

  const handleExpand = () => router.push("/chat/histories");

  const panelStyle = fullPage
    ? {}
    : isFullOverlay
    ? { width: "100%", position: "absolute" as const, inset: 0, zIndex: 20 }
    : { width };

  return (
    <div
      ref={panelRef}
      style={panelStyle}
      className={`border-border bg-background flex flex-shrink-0 border-l transition-[width] duration-0 ${fullPage ? "h-full w-full border-l-0" : "h-full"}`}
    >
      {/* Drag handle — in-flow, left edge of chat panel */}
      {!fullPage && !isFullOverlay && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="w-1 flex-shrink-0 cursor-col-resize hover:bg-blue-500/30 active:bg-blue-500/50 transition-colors self-stretch"
        />
      )}

      {/* Panel content */}
      <div className="flex flex-1 flex-col overflow-hidden">

      {/* Header */}
      <div className="border-border flex h-10 flex-shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {view === "history" && (
            <Button variant="ghost" size="icon-xs" onClick={() => setView("chat")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <Bot className="h-4 w-4" />
          {view === "history" ? "Lịch sử chat" : "AI Chat"}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs"
            onClick={() => setView(view === "history" ? "chat" : "history")}>
            {view === "history" ? "Chat" : "Lịch sử"}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={handleExpand} title="Mở rộng">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          {!fullPage && onClose && (
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {view === "history" ? (
        <div className="flex-1 overflow-y-auto">
          <Button variant="ghost" size="xs" onClick={newChat} className="w-full justify-start gap-2 border-b rounded-none px-3 py-2.5 h-auto">
            <Plus className="h-3.5 w-3.5" /> Chat mới
          </Button>
          {conversations.length === 0 && (
            <p className="text-muted-foreground p-4 text-center text-xs">Chưa có lịch sử chat</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.convId}
              onClick={() => pickConversation(c)}
              className={`hover:bg-muted/50 flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors ${activeConvId === c.convId ? "bg-muted/50" : ""}`}
            >
              <span className="text-foreground line-clamp-1 text-sm font-medium">{c.title}</span>
              <span className="text-muted-foreground line-clamp-1 text-xs">{c.lastMessage || "—"}</span>
              <span className="text-muted-foreground text-[10px]">
                {new Date(c.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-center text-xs">
                Gõ <span className="font-mono">@</span> để chọn tài liệu làm context
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.senderType === "User" ? "items-end" : "items-start"}`}>
                {m.senderType === "User" && m.docIds.length > 0 && (
                  <div className="mb-1 flex flex-wrap justify-end gap-1">
                    {m.docIds.map((id) => {
                      const doc = docs.find((d) => d.docId === id);
                      return (
                        <span key={id} className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
                          @{doc?.title ?? id}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.senderType === "User" ? "bg-foreground text-background" : "bg-muted text-foreground"
                  }`}
                >
                  {m.content || <span className="animate-pulse">▋</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-border border-t p-3">
            {mentionedDocs.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {mentionedDocs.map((d) => (
                  <span key={d.docId} className="bg-muted text-foreground flex items-center gap-1 rounded px-2 py-0.5 text-xs">
                    @{d.title}
                    <Button variant="ghost" size="icon-xs" onClick={() => removeMention(d.docId)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </span>
                ))}
              </div>
            )}

            {mentionQuery !== null && filteredDocs.length > 0 && (
              <div className="border-border bg-background mb-2 max-h-40 overflow-y-auto rounded-lg border shadow-md">
                {filteredDocs.map((d) => (
                  <button
                    key={d.docId}
                    onMouseDown={(e) => { e.preventDefault(); selectMention(d); }}
                    className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                  >
                    <span className="text-muted-foreground text-xs">@</span>
                    {d.title}
                  </button>
                ))}
              </div>
            )}

            <div className="border-input bg-background flex items-end gap-2 rounded-lg border px-3 py-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (mentionQuery === null) send(); }
                  if (e.key === "Escape") setMentionQuery(null);
                }}
                placeholder="Hỏi AI... (gõ @ để chọn tài liệu)"
                disabled={streaming}
                rows={1}
                className="placeholder:text-muted-foreground flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
                style={{ maxHeight: 120, overflowY: "auto" }}
              />
              <Button variant="ghost" size="icon-sm" onClick={send}
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 pb-0.5">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mt-1.5 text-[10px]">Enter gửi · Shift+Enter xuống dòng · @ chọn tài liệu</p>
          </div>
        </>
      )}
      </div>{/* end panel content */}
    </div>
  );
}


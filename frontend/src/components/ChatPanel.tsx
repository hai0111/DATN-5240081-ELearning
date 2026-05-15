"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, ChevronLeft, Maximize2, Plus, Send, X } from "lucide-react";
import { chatService, type ChatMessage, type ConversationItem } from "@/lib/services/chat.service";

interface Props {
  docId: number | null;
  onClose: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function ChatPanel({ docId, onClose, expanded, onToggleExpand }: Props) {
  const [view, setView] = useState<"history" | "chat">("chat");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  useEffect(() => {
    chatService.getConversations().then(setConversations).catch(() => {});
  }, []);

  // Load messages when docId changes (new chat)
  useEffect(() => {
    if (docId == null) return;
    setActiveConvId(null);
    setMessages([]);
    setView("chat");
  }, [docId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setView("chat");
  };

  const send = async () => {
    const q = input.trim();
    if (!q || streaming || docId == null) return;
    setInput("");
    setMessages((prev) => [...prev, { senderType: "User", content: q, sentAt: new Date().toISOString() }]);
    setStreaming(true);

    let aiContent = "";
    setMessages((prev) => [...prev, { senderType: "AI", content: "", sentAt: new Date().toISOString() }]);

    try {
      for await (const chunk of chatService.askStream(q, docId, activeConvId ?? undefined)) {
        aiContent += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: aiContent };
          return next;
        });
      }
      // Refresh conversation list
      chatService.getConversations().then(setConversations).catch(() => {});
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], content: "Đã có lỗi xảy ra." };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className={`border-border bg-background flex h-full flex-shrink-0 flex-col border-l transition-all ${expanded ? "w-[480px]" : "w-80"}`}>
      {/* Header */}
      <div className="border-border flex h-10 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          {view === "history" && (
            <button onClick={() => setView("chat")} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <Bot className="h-4 w-4" />
          {view === "history" ? "Lịch sử chat" : "AI Chat"}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView(view === "history" ? "chat" : "history")}
            className="text-muted-foreground hover:text-foreground rounded px-1.5 py-1 text-[11px]"
            title="Lịch sử"
          >
            {view === "history" ? "Chat" : "Lịch sử"}
          </button>
          <button
            onClick={onToggleExpand}
            className="text-muted-foreground hover:text-foreground rounded p-1"
            title={expanded ? "Thu nhỏ" : "Mở rộng"}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded p-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {view === "history" ? (
        /* ── History list ── */
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={newChat}
            className="border-border text-muted-foreground hover:bg-muted/50 flex w-full items-center gap-2 border-b px-3 py-2.5 text-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Chat mới
          </button>
          {conversations.length === 0 && (
            <p className="text-muted-foreground p-4 text-center text-xs">Chưa có lịch sử chat</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.convId}
              onClick={() => pickConversation(c)}
              className={`hover:bg-muted/50 flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors ${activeConvId === c.convId ? "bg-muted/50" : ""}`}
            >
              <span className="text-foreground line-clamp-1 text-sm font-medium">{c.docTitle}</span>
              <span className="text-muted-foreground line-clamp-1 text-xs">{c.lastMessage || "—"}</span>
              <span className="text-muted-foreground text-[10px]">
                {new Date(c.startTime).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* ── Chat view ── */
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {docId == null && (
              <p className="text-muted-foreground text-center text-xs">Chọn một tài liệu để bắt đầu chat</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderType === "User" ? "justify-end" : "justify-start"}`}>
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
            <div className="border-input bg-background flex items-end gap-2 rounded-lg border px-3 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={docId == null ? "Chọn tài liệu trước..." : "Hỏi về tài liệu này..."}
                disabled={docId == null || streaming}
                rows={1}
                className="placeholder:text-muted-foreground flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
                style={{ maxHeight: 120, overflowY: "auto" }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming || docId == null}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 flex-shrink-0 pb-0.5"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-muted-foreground mt-1.5 text-[10px]">Enter gửi · Shift+Enter xuống dòng</p>
          </div>
        </>
      )}
    </div>
  );
}

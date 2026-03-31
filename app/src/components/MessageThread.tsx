import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "~/components/ui/MessageBubble";

interface Message {
  id: string;
  seq: number;
  role: string;
  content: string;
  metadata?: string | null;
  createdAt: string;
}

interface MessageThreadProps {
  messages: Message[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showNewPill, setShowNewPill] = useState(false);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
    setShowNewPill(false);
    isAtBottomRef.current = true;
  }, []);

  // Track scroll position to determine if user is at bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
      if (isAtBottomRef.current) setShowNewPill(false);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll or show pill on new messages
  useEffect(() => {
    if (messages.length === 0) return;
    if (isAtBottomRef.current) {
      scrollToBottom("smooth");
    } else {
      setShowNewPill(true);
    }
  }, [messages.length, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <p className="font-mono text-gray-500 text-sm py-8">
        &gt; No messages yet.
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            seq={msg.seq}
            metadata={msg.metadata}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {showNewPill && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="bg-cyan-500 text-slate-950 text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg hover:bg-cyan-400 transition-colors"
          >
            New messages ↓
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("sbdv-chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages) setMessages(parsed.messages);
      }
    } catch {
      /* ignore */
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    sessionStorage.setItem("sbdv-chat", JSON.stringify({ messages }));
  }, [messages, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open || messages.length > 0) return;

    const firstName = session?.user?.name?.split(" ")[0];
    const greeting = firstName
      ? t("chat.greetingNamed").replace("{name}", firstName)
      : t("chat.greeting");
    setMessages([{ role: "assistant", content: greeting }]);

    fetch("/api/chat")
      .then((r) => r.json())
      .then((json) => {
        if (json.suggestions) setSuggestions(json.suggestions);
      })
      .catch(() => {});
  }, [open, messages.length, session?.user?.name, t]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const json = await res.json();
      setLoading(false);

      if (json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t("chat.error") },
        ]);
      }
      if (json.suggestions) setSuggestions(json.suggestions);
    },
    [messages, loading, t]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gold text-charcoal rounded-full shadow-lg hover:bg-gold/90 transition-all hover:scale-105 font-body text-sm font-medium"
          aria-label={t("chat.open")}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">{t("chat.open")}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,400px)] h-[min(80vh,560px)] flex flex-col bg-white border border-charcoal/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-charcoal text-off-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="font-heading text-sm font-semibold">{t("chat.title")}</p>
                <p className="font-body text-xs text-off-white/60">{t("chat.subtitle")}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-off-white/10 rounded-sm transition-colors"
                aria-label={t("chat.minimize")}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setMessages([]);
                  sessionStorage.removeItem("sbdv-chat");
                }}
                className="p-2 hover:bg-off-white/10 rounded-sm transition-colors"
                aria-label={t("chat.close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-off-white/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-lg font-body text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gold text-charcoal rounded-br-sm"
                      : "bg-white border border-charcoal/10 text-charcoal rounded-bl-sm shadow-sm"
                  }`}
                >
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-white border border-charcoal/10 rounded-lg rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-charcoal/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {suggestions.length > 0 && messages.length <= 2 && (
            <div className="px-3 py-2 border-t border-charcoal/5 flex flex-wrap gap-2 shrink-0 bg-white">
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 border border-gold/40 text-charcoal rounded-full hover:bg-gold/10 font-body transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3 border-t border-charcoal/10 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder")}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-charcoal/20 rounded-lg font-body text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 bg-gold text-charcoal rounded-lg hover:bg-gold/90 disabled:opacity-40 transition-colors"
                aria-label={t("chat.send")}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="font-body text-[10px] text-charcoal/40 mt-2 text-center">{t("chat.disclaimer")}</p>
          </form>
        </div>
      )}
    </>
  );
}

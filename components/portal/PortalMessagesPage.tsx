"use client";

import { useEffect, useState } from "react";
import { Send, Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface Message {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  sender: { name: string | null; email: string };
}

export default function PortalMessagesPage() {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const loadMessages = () => {
    fetch("/api/portal/messages")
      .then((res) => res.json())
      .then((json) => setMessages(json.messages || []));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    setSubject("");
    setBody("");
    setShowCompose(false);
    setSending(false);
    loadMessages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-charcoal">
            {t("portal.messages.title")}
          </h1>
          <p className="flex items-center gap-2 text-sm font-body text-charcoal/50 mt-2">
            <Lock className="w-4 h-4" />
            {t("portal.messages.encrypted")}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90"
        >
          {t("portal.messages.compose")}
        </button>
      </div>

      {showCompose && (
        <form onSubmit={handleSend} className="mb-8 p-6 bg-white border border-charcoal/10 rounded-lg space-y-4">
          <input
            type="text"
            placeholder={t("portal.messages.subject")}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body"
          />
          <textarea
            placeholder={t("portal.messages.body")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body resize-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? t("common.submitting") : t("portal.messages.send")}
          </button>
        </form>
      )}

      {messages.length === 0 ? (
        <p className="font-body text-charcoal/60">{t("portal.messages.noMessages")}</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="p-6 bg-white border border-charcoal/10 rounded-lg">
              <div className="flex justify-between mb-2">
                <h3 className="font-heading font-semibold text-charcoal">{msg.subject}</h3>
                <span className="text-xs font-body text-charcoal/50">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="font-body text-charcoal/70">{msg.body}</p>
              <p className="text-xs font-body text-charcoal/40 mt-2">
                From: {msg.sender.name || msg.sender.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

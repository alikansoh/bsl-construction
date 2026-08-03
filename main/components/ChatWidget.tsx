"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

// Known internal pages the assistant might reference, mapped to a friendly button label.
const PAGE_LABELS: Record<string, string> = {
  "/": "Visit Homepage",
  "/about": "About Us",
  "/services": "Our Services",
  "/projects": "View Projects",
  "/contact": "Contact Us",
};

const PHONE_REGEX = /\+44\s?\d{4}\s?\d{6}/g;
const PAGE_REGEX = /\/(contact|about|services|projects)\b/gi;

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Strips markdown bold markers for clean prose, and extracts phone numbers /
// known page paths so they can be rendered as action buttons under the bubble.
function parseAssistantMessage(content: string) {
  const text = content.replace(/\*\*/g, "");

  const phones = Array.from(new Set(text.match(PHONE_REGEX) ?? []));
  const pages = Array.from(
    new Set((text.match(PAGE_REGEX) ?? []).map((p) => p.toLowerCase()))
  );

  return { text, phones, pages };
}

function MessageActions({ phones, pages }: { phones: string[]; pages: string[] }) {
  if (phones.length === 0 && pages.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {phones.map((phone) => (
        <a
          key={phone}
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#A26028] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#8A5121]"
        >
          <PhoneIcon />
          Call {phone}
        </a>
      ))}
      {pages.map((page) => (
        <Link
          key={page}
          href={page}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#A26028] bg-white px-3 py-1.5 text-xs font-medium text-[#A26028] transition-colors hover:bg-[#A26028] hover:text-white"
        >
          {PAGE_LABELS[page] ?? page}
          <ArrowIcon />
        </Link>
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[480px] w-[340px] flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B0B0D] px-4 py-3">
            <span className="text-sm font-medium text-white">Ask us anything</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-[#6b6b70]">
                Hi! Ask me about our projects, services, or blog.
              </p>
            )}
            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div
                    key={i}
                    className="ml-auto max-w-[85%] rounded-lg bg-[#A26028] px-3 py-2 text-sm text-white"
                  >
                    {m.content}
                  </div>
                );
              }

              const { text, phones, pages } = parseAssistantMessage(m.content);
              return (
                <div
                  key={i}
                  className="max-w-[85%] rounded-lg bg-[#F4F1EA] px-3 py-2 text-sm text-[#0B0B0D]"
                >
                  {text}
                  <MessageActions phones={phones} pages={pages} />
                </div>
              );
            })}
            {loading && (
              <div className="w-fit rounded-lg bg-[#F4F1EA] px-3 py-2 text-sm text-[#6b6b70]">
                Typing…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-black/10 px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#A26028]"
            />
            <button
              onClick={sendMessage}
              className="rounded-full bg-[#A26028] px-4 py-2 text-sm text-white hover:bg-[#8A5121]"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A26028] text-white shadow-lg hover:bg-[#8A5121]"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
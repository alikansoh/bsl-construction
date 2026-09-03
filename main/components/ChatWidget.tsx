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

// TODO: replace with your real emergency / urgent-callout number
const EMERGENCY_PHONE = "07378 412002";

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

// Sticky banner shown at the very top of the chat panel so an urgent caller
// never has to type anything to reach a human.
function EmergencyBanner() {
  return (
    <a
      href={`tel:${EMERGENCY_PHONE.replace(/\s/g, "")}`}
      className="group relative flex items-center gap-3 overflow-hidden bg-gradient-to-r from-[#C0392B] to-[#E05A45] px-4 py-2.5 text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] transition-all hover:from-[#A5311F] hover:to-[#C0392B]"
    >
      {/* subtle shine sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
        <span className="absolute h-full w-full animate-ping rounded-full bg-white/20" />
        <PhoneIcon />
      </span>

      <span className="relative flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">
          Need urgent help?
        </span>
        <span className="text-sm font-bold tracking-tight">
          Call {EMERGENCY_PHONE}
        </span>
      </span>

      <span className="relative ml-auto flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-white/30 transition-colors group-hover:bg-white/25">
        Call now
        <ArrowIcon />
      </span>
    </a>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus the input whenever the panel opens, so people can start typing right away.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Lock background scroll while the chat is open, so the keyboard opening
  // can't drag the whole page (and the widget with it) upward.
  useEffect(() => {
    if (!open) return;
    const { overflow, position, width } = document.body.style;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = "";
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Track how much the on-screen keyboard eats into the viewport (via the
  // VisualViewport API) and lift the widget by exactly that much, instead of
  // letting the browser's default "scroll input into view" behavior push it.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    function handleViewportChange() {
      const inset = window.innerHeight - vv!.height - vv!.offsetTop;
      setKeyboardInset(inset > 0 ? inset : 0);
    }

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);
    handleViewportChange();

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
      setKeyboardInset(0);
    };
  }, [open]);

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
      inputRef.current?.focus();
    }
  }

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end sm:inset-x-auto sm:bottom-6 sm:right-6"
      style={{ transform: keyboardInset ? `translateY(-${keyboardInset}px)` : undefined }}
    >
      {open && (
        <div className="mb-3 flex h-[70vh] max-h-[480px] w-[calc(100vw-2rem)] max-w-[340px] flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl">
          <EmergencyBanner />

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
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              // Always 16px: below that, iOS Safari auto-zooms on focus regardless of breakpoint.
              style={{ fontSize: 16 }}
              className="flex-1 rounded-full border border-black/10 px-3 py-2 outline-none focus:border-[#A26028]"
            />
            <button
              onClick={sendMessage}
              className="shrink-0 rounded-full bg-[#A26028] px-4 py-2 text-sm text-white hover:bg-[#8A5121]"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A26028] text-white shadow-lg hover:bg-[#8A5121]"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
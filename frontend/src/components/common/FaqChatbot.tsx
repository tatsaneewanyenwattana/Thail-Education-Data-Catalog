"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FAQ_CATEGORIES,
  QUICK_ACTIONS,
  getFaqById,
  searchFaq,
  type FaqCategory,
  type FaqItem,
} from "@/data/faqData";

type ViewState =
  | { type: "home" }
  | { type: "category"; categoryId: string }
  | { type: "answer"; item: FaqItem }
  | { type: "search"; keyword: string; results: FaqItem[] };

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
  item?: FaqItem;
  relatedItems?: FaqItem[];
};

function ChatIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14H5.17L4 17.17V4h16v12Z" />
      <path d="M7 9h10v2H7V9Zm0-3h10v2H7V6Zm0 6h7v2H7v-2Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h4V9H1v12Zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2Z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2Zm4 0v12h4V3h-4Z" />
    </svg>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const cls = "h-5 w-5";
  switch (name) {
    case "search":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case "account":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
        </svg>
      );
    case "download":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      );
    case "scholarship":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" />
        </svg>
      );
    case "api":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Z" />
        </svg>
      );
  }
}

export default function FaqChatbot() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "th";
  const t = (th: string, en: string) => (locale === "th" ? th : en);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchText, setSearchText] = useState("");
  const [view, setView] = useState<ViewState>({ type: "home" });
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());
  const msgIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++msgIdRef.current;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId(),
          from: "bot",
          text: t(
            "สวัสดีค่ะ! ต้องการความช่วยเหลืออะไร เลือกหมวดด้านล่าง หรือพิมพ์คำถามได้เลยค่ะ",
            "Hello! How can I help you? Select a category below or type your question."
          ),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addBotMessage = (text: string, item?: FaqItem, relatedItems?: FaqItem[]) => {
    setMessages((prev) => [...prev, { id: nextId(), from: "bot", text, item, relatedItems }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), from: "user", text }]);
  };

  const handleCategoryClick = (cat: FaqCategory) => {
    addUserMessage(locale === "th" ? cat.title.th : cat.title.en);
    setView({ type: "category", categoryId: cat.id });
    addBotMessage(
      t(
        `หมวด "${cat.title.th}" มีคำถามเหล่านี้ค่ะ เลือกกดได้เลย`,
        `Here are the questions in "${cat.title.en}". Click to see the answer.`
      )
    );
  };

  const handleQuestionClick = (item: FaqItem) => {
    addUserMessage(locale === "th" ? item.question.th : item.question.en);
    const answer = locale === "th" ? item.answer.th : item.answer.en;
    const relatedItems = item.related
      ?.map((id) => getFaqById(id))
      .filter((x): x is FaqItem => !!x);
    addBotMessage(answer, item, relatedItems);
    setView({ type: "answer", item });
  };

  const handleSearch = () => {
    const keyword = searchText.trim();
    if (!keyword) return;
    addUserMessage(keyword);
    const results = searchFaq(keyword, locale);
    if (results.length > 0) {
      addBotMessage(
        t(
          `พบ ${results.length} คำถามที่เกี่ยวข้อง กดเลือกได้เลยค่ะ`,
          `Found ${results.length} related questions. Click to see the answer.`
        )
      );
      setView({ type: "search", keyword, results });
    } else {
      addBotMessage(
        t(
          "ไม่พบคำถามที่ตรงกัน ลองใช้คำอื่น หรือเลือกหมวดด้านล่างนะคะ",
          "No matching questions found. Try different keywords or select a category below."
        )
      );
      setView({ type: "home" });
    }
    setSearchText("");
  };

  const handleBackToHome = () => {
    addBotMessage(
      t("เลือกหมวดที่ต้องการได้เลยค่ะ", "Select a category below.")
    );
    setView({ type: "home" });
  };

  const handleFeedback = (msgId: number, positive: boolean) => {
    setFeedbackGiven((prev) => new Set(prev).add(msgId));
    addBotMessage(
      positive
        ? t("ขอบคุณค่ะ! ดีใจที่ช่วยได้", "Thanks! Glad it helped!")
        : t(
            "ขอบคุณสำหรับความคิดเห็น จะนำไปปรับปรุงนะคะ",
            "Thanks for your feedback. We'll work to improve."
          )
    );
  };

  const showCategories = view.type === "home";
  const showQuestions = view.type === "category" || view.type === "search";
  const currentCategory = view.type === "category"
    ? FAQ_CATEGORIES.find((c) => c.id === view.categoryId)
    : null;
  const currentQuestions = view.type === "category"
    ? currentCategory?.items ?? []
    : view.type === "search"
      ? view.results
      : [];

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #0045bc 0%, #2979ff 100%)" }}
        aria-label={t("ช่วยเหลือ", "Help")}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl max-[420px]:bottom-0 max-[420px]:left-0 max-[420px]:right-0 max-[420px]:top-0 max-[420px]:h-full max-[420px]:w-full max-[420px]:rounded-none">
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 text-white"
            style={{ background: "linear-gradient(135deg, #0045bc 0%, #2979ff 100%)" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <ChatIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-kanit text-body-lg font-bold">
                {t("ช่วยเหลือ", "Help Center")}
              </h3>
              <p className="text-xs text-white/70">
                {t("ถามได้เลย เราพร้อมช่วยค่ะ", "We're here to help!")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20"
              aria-label={t("ปิด", "Close")}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 py-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={`/${locale}${action.href}`}
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                {locale === "th" ? action.label.th : action.label.en}
              </Link>
            ))}
          </div>

          {/* Messages area */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 font-sarabun text-sm leading-relaxed ${
                    msg.from === "bot"
                      ? "mr-auto bg-gray-100 text-gray-800"
                      : "ml-auto bg-blue-600 text-white"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Link */}
                  {msg.item?.link && (
                    <Link
                      href={`/${locale}${msg.item.link.href}`}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      {locale === "th" ? msg.item.link.label.th : msg.item.link.label.en}
                    </Link>
                  )}

                  {/* Related questions */}
                  {msg.relatedItems && msg.relatedItems.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-2">
                      <p className="mb-1 text-xs font-medium text-gray-500">
                        {t("คำถามที่เกี่ยวข้อง:", "Related questions:")}
                      </p>
                      {msg.relatedItems.map((ri) => (
                        <button
                          key={ri.id}
                          type="button"
                          onClick={() => handleQuestionClick(ri)}
                          className="block w-full text-left text-xs text-blue-600 hover:underline"
                        >
                          {locale === "th" ? ri.question.th : ri.question.en}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {msg.from === "bot" && msg.item && !feedbackGiven.has(msg.id) && (
                  <div className="mt-1 flex items-center gap-1 pl-1">
                    <span className="text-[11px] text-gray-400">
                      {t("คำตอบนี้ช่วยได้ไหม?", "Was this helpful?")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, true)}
                      className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"
                    >
                      <ThumbUpIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, false)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <ThumbDownIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Category / Question buttons */}
            {showCategories && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                  >
                    <span className="text-blue-600">
                      <CategoryIcon name={cat.icon} />
                    </span>
                    {locale === "th" ? cat.title.th : cat.title.en}
                  </button>
                ))}
              </div>
            )}

            {showQuestions && (
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <BackIcon />
                  {t("กลับหน้าหลัก", "Back to categories")}
                </button>
                {currentQuestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQuestionClick(item)}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                  >
                    {locale === "th" ? item.question.th : item.question.en}
                  </button>
                ))}
              </div>
            )}

            {view.type === "answer" && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <BackIcon />
                  {t("ถามเรื่องอื่น", "Ask another question")}
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Search input */}
          <div className="border-t border-gray-200 px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("พิมพ์คำถามของคุณ...", "Type your question...")}
                className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
              >
                <SearchIcon />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[11px] text-gray-400">
              {t(
                "ต้องการความช่วยเหลือเพิ่ม? ",
                "Need more help? "
              )}
              <Link
                href={`/${locale}/help-center`}
                onClick={() => setOpen(false)}
                className="text-blue-500 hover:underline"
              >
                {t("ติดต่อเรา", "Contact us")}
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

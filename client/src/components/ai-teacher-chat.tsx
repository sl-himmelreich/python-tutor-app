import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import {
  X,
  Send,
  Volume2,
  VolumeX,
  Loader2,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AITeacherChatProps {
  lessonTitle: string;
  lessonDescription: string;
  currentStepTitle: string;
  currentStepType: string;
}

export function AITeacherChat({
  lessonTitle,
  lessonDescription,
  currentStepTitle,
  currentStepType,
}: AITeacherChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIdx, setSpeakingMessageIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const buildLessonContext = () => {
    return `Урок: ${lessonTitle}\nОписание: ${lessonDescription}\nТекущий шаг: ${currentStepTitle} (${currentStepType === "theory" ? "теория" : currentStepType === "quiz" ? "тест" : "задание с кодом"})`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/chat", {
        message: userMessage,
        lessonContext: buildLessonContext(),
        history: newMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else if (data.error) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `⚠️ ${data.error}` },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Не удалось связаться с учителем. Попробуй ещё раз.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string, idx: number) => {
    // If already speaking this message, stop
    if (isSpeaking && speakingMessageIdx === idx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/⚠️/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ru-RU";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Try to find a Russian voice
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find((v) => v.lang.startsWith("ru"));
    if (ruVoice) utterance.voice = ruVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageIdx(null);
    };

    setIsSpeaking(true);
    setSpeakingMessageIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Объясни проще",
    "Покажи пример",
    "Подскажи с заданием",
    "Что значит ошибка?",
  ];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary to-[hsl(280_60%_55%)]",
            "flex items-center justify-center text-white",
            "hover:scale-105 active:scale-95 transition-transform",
            "animate-in fade-in zoom-in-50 duration-200"
          )}
          data-testid="ai-teacher-open-btn"
          aria-label="Спросить учителя"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-5 right-5 z-50 w-[380px] max-w-[calc(100vw-2rem)]",
            "bg-card border border-border rounded-2xl shadow-xl",
            "flex flex-col overflow-hidden",
            "animate-in fade-in slide-in-from-bottom-4 duration-200",
            "h-[520px] max-h-[calc(100vh-6rem)]"
          )}
          data-testid="ai-teacher-panel"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-[hsl(280_60%_55%)] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Питоша</p>
              <p className="text-xs text-white/70 truncate">Твой ИИ-помощник по Python</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              data-testid="ai-teacher-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Привет! Я Питоша
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Спроси меня что угодно по уроку — объясню, помогу с заданием
                    или покажу пример.
                  </p>
                </div>
                {/* Quick questions */}
                <div className="flex flex-wrap gap-1.5 justify-center px-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      data-testid={`quick-q-${q.slice(0, 10)}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center",
                    msg.role === "user"
                      ? "bg-primary/10"
                      : "bg-gradient-to-br from-primary/20 to-[hsl(280_60%_55%)]/20"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-md"
                      : "bg-muted/70 text-foreground rounded-tl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  {/* TTS button for assistant messages */}
                  {msg.role === "assistant" && !msg.content.startsWith("⚠️") && (
                    <button
                      onClick={() => speakMessage(msg.content, idx)}
                      className={cn(
                        "mt-1.5 flex items-center gap-1 text-xs transition-colors",
                        msg.role === "assistant" && isSpeaking && speakingMessageIdx === idx
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      data-testid={`tts-btn-${idx}`}
                    >
                      {isSpeaking && speakingMessageIdx === idx ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Остановить</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Озвучить</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-[hsl(280_60%_55%)]/20 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted/70 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Спроси что-нибудь..."
                disabled={isLoading}
                className="flex-1 min-w-0 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                data-testid="ai-teacher-input"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-10 w-10 p-0 rounded-xl flex-shrink-0"
                data-testid="ai-teacher-send-btn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

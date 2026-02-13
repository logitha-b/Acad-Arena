import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "How do I register for an event?",
  "How do I create a team?",
  "How does the leaderboard work?",
  "How do I host an event?",
];

const getLocalResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes("register") || lower.includes("sign up"))
    return "To register for an event:\n1. Browse events on the **Explore Events** page\n2. Click on any event to see details\n3. Click **Register Now**\n4. You'll need to log in first if you haven't already!";
  if (lower.includes("team") || lower.includes("teammate"))
    return "To find or create a team:\n1. Go to the **Team Finder** page\n2. Browse existing teams or click **Create Team**\n3. Add skills needed and max members\n4. Others can request to join your team!";
  if (lower.includes("leaderboard") || lower.includes("points") || lower.includes("ranking"))
    return "The **Leaderboard** ranks users by participation points. You earn points by:\n- Attending events (+10 pts)\n- Winning competitions (+50 pts)\n- Getting certificates (+25 pts)\n\nFilter by college or time period!";
  if (lower.includes("host") || lower.includes("create event") || lower.includes("organize"))
    return "To host an event:\n1. Go to the **Host Event** page\n2. Fill in event details (title, date, category, etc.)\n3. Upload a banner image\n4. Set pricing and capacity\n5. Submit for review!";
  if (lower.includes("bookmark") || lower.includes("save") || lower.includes("favorite"))
    return "You can **bookmark** events by clicking the ❤️ heart icon on any event card. View all saved events in your **Dashboard** under the Saved Events tab.";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hello! 👋 I'm BrainyBot, your event assistant! I can help you with:\n- Finding & registering for events\n- Creating teams\n- Understanding the leaderboard\n- Hosting events\n\nWhat would you like to know?";
  return "I can help you with:\n- **Registering** for events\n- **Creating teams** for hackathons\n- Understanding the **leaderboard**\n- **Hosting** your own events\n- **Bookmarking** events\n\nTry asking about any of these topics! 😊";
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm BrainyBot, your event assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getLocalResponse(text);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="gradient-bg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-primary-foreground">BrainyBot</h3>
              <p className="text-xs text-primary-foreground/80">Always here to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "gradient-bg text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask me anything..."
              className="h-10"
            />
            <Button variant="hero" size="icon" className="h-10 w-10 shrink-0" onClick={() => sendMessage(input)}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

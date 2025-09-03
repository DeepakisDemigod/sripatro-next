"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function BookingChat({
  bookingId,
  userEmail,
  astrologerEmail,
  setSendVideoLinkCallback,
}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/chat?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(msg = null) {
    const messageToSend = msg !== null ? msg : input;
    if (!messageToSend.trim()) return;
    setLoading(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        sender: session.user.email,
        receiver:
          session.user.email === userEmail ? astrologerEmail : userEmail,
        message: messageToSend,
      }),
    });
    if (msg === null) setInput("");
    setLoading(false);
  }

  useEffect(() => {
    if (setSendVideoLinkCallback && session?.user?.email === astrologerEmail) {
      setSendVideoLinkCallback((videoUrl) =>
        sendMessage(`Click link to join call: ${videoUrl}`)
      );
    }
  }, [setSendVideoLinkCallback, astrologerEmail, session]);

  if (!session || !session.user)
    return <div className="text-center text-gray-500">Loading chat...</div>;

  return (
    <div
      className="bg-base-100 border border-red-200 rounded-2xl shadow-md p-0 mt-4 max-w-3xl w-full flex flex-col relative"
      style={{ minHeight: "24rem" }}
    >
      <div className="px-4 pt-4 pb-2 border-b border-base-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-red-600">Chat</h3>
        <span className="text-xs text-base-content/60">Booking Chat</span>
      </div>
      <div
        className="flex-1 h-screen overflow-y-auto bg-base-200 px-2 py-3 space-y-2"
        style={{ minHeight: "16rem", marginBottom: "4.5rem" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-base-content/50 mt-8">
            No messages yet.
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === session.user.email;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm break-words ${isMe ? "bg-red-600 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md border border-base-300"}`}
              >
                <span
                  className={`block text-xs mb-1 ${isMe ? "text-red-100" : "text-gray-400"}`}
                >
                  {isMe ? "You" : msg.sender}
                </span>
                <span>
                  {(() => {
                    // Detect URLs in message and render as clickable links
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = msg.message.split(urlRegex);
                    return parts.map((part, i) => {
                      if (urlRegex.test(part)) {
                        return (
                          <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600 hover:text-blue-800"
                          >
                            {part}
                          </a>
                        );
                      }
                      return part;
                    });
                  })()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="flex items-center gap-2 border-t border-base-200 bg-base-100 px-3 py-2 md:static md:mt-0 md:mb-0 md:rounded-b-2xl md:relative fixed bottom-0 left-0 w-full z-10 rounded-b-2xl"
        style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="input input-bordered w-full border-base-300 focus:border-red-600 focus:ring-0 rounded-full px-4 py-2 text-base"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-error bg-red-600 text-white rounded-full px-5"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

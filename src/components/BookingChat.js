"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function BookingChat({ bookingId, userEmail, astrologerEmail }) {
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

  async function sendMessage() {
    if (!input.trim()) return;
    setLoading(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        sender: session.user.email,
        receiver:
          session.user.email === userEmail ? astrologerEmail : userEmail,
        message: input,
      }),
    });
    setInput("");
    setLoading(false);
  }

  if (!session || !session.user)
    return <div className="text-center text-gray-500">Loading chat...</div>;

  return (
    <div className="bg-base-100 border border-red-600 rounded-lg p-4 mt-4 max-w-md w-full">
      <h3 className="text-lg font-bold text-red-600 mb-2">Chat</h3>
      <div className="h-48 overflow-y-auto mb-2 bg-base-200 rounded p-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 flex ${msg.sender === session.user.email ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg ${msg.sender === session.user.email ? "bg-red-600 text-white" : "bg-base-300 text-black"}`}
            >
              <span className="block text-xs text-gray-300">
                {msg.sender === session.user.email ? "You" : msg.sender}
              </span>
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="input input-bordered w-full border-red-600"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button
          className="btn btn-error bg-red-600 text-white"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

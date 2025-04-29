"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, MessageSquare } from "lucide-react";
import { usePeer } from "../utils/PeerProvider";
import Button from "./ui/button";
import Input from "./ui/input";

export default function LobbyChat() {
  const { handleSendMessage, messages, user } = usePeer();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    handleSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        <div className="space-y-3">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.isSystem
                  ? "bg-neutral-800 bg-opacity-50 border border-neutral-700"
                  : message.sender === user?.name
                  ? "bg-neutral-800 ml-4 rounded-tr-none"
                  : "bg-neutral-800 mr-4 rounded-tl-none"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>
              {message.isSystem ? (
                <div className="text-neutral-500 text-center text-sm">{message.text}</div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <span
                      className={`font-bold text-sm ${
                        message.sender === user?.name ? "text-blue-400" : "text-green-400"
                      }`}>
                      {message.sender}
                    </span>
                  </div>
                  <p className="text-white mt-1">{message.text}</p>
                </>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          autoFocus
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          fullWidth
          icon={<MessageSquare className="w-4 h-4" />}
        />
        <Button
          onClick={handleSend}
          variant="secondary"
          size="md"
          icon={<Send className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Send, MessageSquare } from "lucide-react";
import Panel from "./ui/panel";
import Button from "./ui/button";
import Input from "./ui/input";
import { usePeer } from "../utils/PeerProvider";

export default function ChatRoom() {
  const { messages, handleSendMessage, user } = usePeer();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

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
    const element = messageContainerRef.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isVisible) {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  return (
    <Panel title="Chat" variant="bordered" className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto mb-4">
        <div ref={messageContainerRef} className="space-y-3">
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
          <div ref={messagesEndRef}  />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
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
    </Panel>
  );
}

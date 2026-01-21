'use client';

import React, { useState, useRef, useEffect } from 'react';
import { processAiQuery } from '@/lib/ai-assistant';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { createPortal } from 'react-dom';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

interface CineBrainChatProps {
    variant?: 'floating' | 'header';
}

export function CineBrainChat({ variant = 'floating' }: CineBrainChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am CineBrain 🤖. Ask me anything about our gear!' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const response = await processAiQuery(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, my brain is foggy. Try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    // Portal content
    const chatWindow = (
        <div className="fixed bottom-0 right-0 sm:bottom-24 sm:right-6 w-full sm:w-96 h-[80vh] sm:h-[500px] z-[9999] bg-background/95 backdrop-blur-md border-t sm:border border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
            {/* Header */}
            <div className="bg-primary/10 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">CineBrain AI</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">Beta</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary/20'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                        </div>
                        <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-secondary/50 border border-border rounded-tl-sm'
                            }`}>
                            {msg.content.split('**').map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-secondary/50 border border-border p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Ask about cameras, lenses..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-secondary/50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-primary text-primary-foreground p-2 rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Trigger Button */}
            {variant === 'floating' ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'rotate-90 bg-destructive text-white' : 'bg-primary text-primary-foreground'}`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10 text-muted-foreground'}`}
                    title="AI Assistant"
                >
                    <Sparkles className="w-5 h-5" />
                </button>
            )}

            {/* Chat Window - Portalled to body to escape sticky header context */}
            {isOpen && typeof document !== 'undefined' && createPortal(chatWindow, document.body)}
        </>
    );
}

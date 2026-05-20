'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Spin, Typography } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import ProductCard from './ProductCard';
import RelatedProductsCarousel from './RelatedProductsCarousel';

const { Text } = Typography;

interface Product {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  in_stock: boolean;
  category?: string;
  description?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  type: 'text' | 'product_card' | 'options' | 'related_carousel';
  text?: string;
  product?: Product;
  products?: Product[];
  timestamp: Date;
  showOptions?: boolean;
}

// Conversation history for Gemini multi-turn
interface ConversationTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatWindowProps {
  triggerQuery?: string;
  onClearTrigger?: () => void;
  onClose?: () => void;
}

// Keywords that strongly suggest the user is searching for a product in DB
const PRODUCT_SEARCH_KEYWORDS = [
  'smartwatch', 'watch', 'ঘড়ি',
  'headphone', 'হেডফোন',
  'keyboard', 'কীবোর্ড',
  'backpack', 'bag', 'ব্যাগ',
  'sunglasses', 'চশমা',
  'chair', 'চেয়ার',
  'lamp', 'ল্যাম্প',
  'mug', 'মগ',
  'sleek', 'wireless', 'mechanical', 'minimalist', 'designer', 'ergonomic', 'premium', 'ceramic',
];

function looksLikeProductSearch(query: string): boolean {
  const q = query.toLowerCase();
  return PRODUCT_SEARCH_KEYWORDS.some((k) => q.includes(k));
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ triggerQuery, onClearTrigger, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<any>(null);

  // Conversation history for Gemini (multi-turn)
  const conversationHistory = useRef<ConversationTurn[]>([]);

  // Client-side cache for product DB lookups only
  const productCache = useRef<Record<string, any>>({});

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        type: 'text',
        text: 'আসসালামু আলাইকুম! আমাদের শপে আপনাকে স্বাগতম 😊 আমি আপনার শপিং অ্যাসিস্ট্যান্ট। কী খুঁজছেন বলুন, বা যেকোনো প্রশ্ন করুন!',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Trigger from product card click
  useEffect(() => {
    if (triggerQuery) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessages((prev) => prev.map((m) => (m.type === 'options' ? { ...m, showOptions: false } : m)));
      setMessages((prev) => [
        ...prev,
        { id: `user-trigger-${Date.now()}`, sender: 'user', type: 'text', text: triggerQuery, timestamp: new Date() },
      ]);
      handleMessage(triggerQuery);
      if (onClearTrigger) onClearTrigger();
    }
  }, [triggerQuery]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup timer
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // ─── Core: Call our secure /api/chat Next.js route ───────────────────────
  const callGemini = async (userMessage: string, productContext?: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          productContext: productContext || '',
          history: conversationHistory.current,
        }),
      });

      if (!res.ok) throw new Error('API route error');

      const data = await res.json();
      const reply = data.response || 'দুঃখিত, আবার চেষ্টা করুন।';

      // Save this turn in history for next request
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: reply }] },
      ];

      // Keep history at max 10 turns (20 entries) to avoid token limit
      if (conversationHistory.current.length > 20) {
        conversationHistory.current = conversationHistory.current.slice(-20);
      }

      return reply;
    } catch (err) {
      console.error('callGemini error:', err);
      return 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।';
    }
  };

  // ─── Main message handler ─────────────────────────────────────────────────
  const handleMessage = async (userText: string) => {
    setIsLoading(true);

    try {
      if (looksLikeProductSearch(userText)) {
        // ── Route A: Product search in Laravel DB ───────────────────────
        await handleProductSearch(userText);
      } else {
        // ── Route B: General conversation → Gemini directly ──────────
        const reply = await callGemini(userText);
        addBotText(reply);
      }
    } catch (err) {
      console.error('handleMessage error:', err);
      addBotText('দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Product search against Laravel DB ───────────────────────────────────
  const handleProductSearch = async (query: string) => {
    const key = query.trim().toLowerCase();

    let data: any;
    if (productCache.current[key]) {
      data = productCache.current[key];
    } else {
      const res = await fetch(`${apiBase}/api/products/search?q=${encodeURIComponent(query)}`);
      data = await res.json();
      productCache.current[key] = data;
    }

    if (data.found && data.product) {
      const ctx = `Product: ${data.product.name}, Price: $${data.product.price}, Category: ${data.product.category}, Stock: ${data.product.in_stock ? 'In Stock' : 'Out of Stock'}, Description: ${data.product.description}`;
      const reply = await callGemini(`${data.product.name} সম্পর্কে বলুন`, ctx);

      setMessages((prev) => [
        ...prev,
        { id: `bot-text-${Date.now()}`, sender: 'bot', type: 'text', text: reply, timestamp: new Date() },
        { id: `bot-card-${Date.now()}`, sender: 'bot', type: 'product_card', product: data.product, timestamp: new Date() },
      ]);
    } else {
      // Not found in DB – tell Gemini to handle it conversationally
      const reply = await callGemini(query);
      addBotText(reply);

      // Show yes/no for browsing alternatives
      const yesNoId = `bot-options-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: yesNoId, sender: 'bot', type: 'options', timestamp: new Date(), showOptions: true },
      ]);
      startNoReplyTimer(yesNoId);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const addBotText = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `bot-${Date.now()}`, sender: 'bot', type: 'text', text, timestamp: new Date() },
    ]);
  };

  const startNoReplyTimer = (optionsId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === optionsId ? { ...m, showOptions: false } : m)));
      showRelatedProducts('আপনি কোনো সাড়া দেননি। তবে এই পণ্যগুলো দেখতে পারেন:');
    }, 10000);
  };

  const showRelatedProducts = async (msg: string) => {
    addBotText(msg);
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/products/related?limit=4`);
      const products = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: `bot-related-${Date.now()}`, sender: 'bot', type: 'related_carousel', products, timestamp: new Date() },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYes = (optionsId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages((prev) => prev.map((m) => (m.id === optionsId ? { ...m, showOptions: false } : m)));
    setMessages((prev) => [
      ...prev,
      { id: `user-yes-${Date.now()}`, sender: 'user', type: 'text', text: 'হ্যাঁ', timestamp: new Date() },
      { id: `bot-yes-${Date.now()}`, sender: 'bot', type: 'text', text: 'ঠিক আছে! কোন পণ্যটি খুঁজছেন বলুন।', timestamp: new Date() },
    ]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleNo = (optionsId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages((prev) => prev.map((m) => (m.id === optionsId ? { ...m, showOptions: false } : m)));
    setMessages((prev) => [
      ...prev,
      { id: `user-no-${Date.now()}`, sender: 'user', type: 'text', text: 'না', timestamp: new Date() },
    ]);
    showRelatedProducts('কোনো সমস্যা নেই! আমাদের এই জনপ্রিয় পণ্যগুলো দেখুন:');
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setMessages((prev) => prev.map((m) => (m.type === 'options' ? { ...m, showOptions: false } : m)));
    }

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', type: 'text', text, timestamp: new Date() },
    ]);
    setInputValue('');
    handleMessage(text);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '620px',
      borderRadius: '24px', background: '#0b0f19',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      overflow: 'hidden', width: '100%', maxWidth: '480px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg,#111827 0%,#0f172a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Avatar icon={<RobotOutlined />} style={{
          background: 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',
          boxShadow: '0 0 12px rgba(59,130,246,0.5)',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>শপ অ্যাসিস্ট্যান্ট</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <Text style={{ color: '#9ca3af', fontSize: '11px' }}>Gemini AI · অনলাইন</Text>
          </div>
        </div>
        {onClose && (
          <Button type="text" icon={<CloseOutlined style={{ color: '#9ca3af', fontSize: '16px' }} />}
            onClick={onClose}
            style={{ marginLeft: 'auto', border: 'none', background: 'transparent', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end',
              alignItems: 'flex-start', gap: '8px',
              maxWidth: '90%', alignSelf: isBot ? 'flex-start' : 'flex-end',
            }}>
              {isBot && (
                <Avatar size="small" icon={<RobotOutlined />}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {msg.type === 'text' && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                    background: isBot ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
                    border: isBot ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    color: '#fff', fontSize: '14px', lineHeight: '1.6',
                    wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                )}
                {msg.type === 'product_card' && msg.product && <ProductCard product={msg.product} />}
                {msg.type === 'related_carousel' && msg.products && <RelatedProductsCarousel products={msg.products} />}
                {msg.type === 'options' && msg.showOptions && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <Button type="primary" onClick={() => handleYes(msg.id)}
                      style={{ background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
                      হ্যাঁ, খুঁজি
                    </Button>
                    <Button onClick={() => handleNo(msg.id)}
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontWeight: 600 }}>
                      না, দেখি
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', fontSize: '11px' }}>
                      <ClockCircleOutlined /><span>১০ সেকেন্ড</span>
                    </div>
                  </div>
                )}
                <span style={{ color: '#6b7280', fontSize: '9px', alignSelf: isBot ? 'flex-start' : 'flex-end', marginTop: '2px' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!isBot && (
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#2563eb', flexShrink: 0 }} />
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
            <Avatar size="small" icon={<RobotOutlined />} style={{ background: '#1e293b' }} />
            <div style={{
              padding: '10px 16px', borderRadius: '0 16px 16px 16px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Spin size="small" />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>টাইপ করছে...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px', background: '#090d16',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: '10px',
      }}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="কিছু জিজ্ঞেস করুন বা পণ্য খুঁজুন..."
          disabled={isLoading}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', padding: '10px 16px',
          }}
          suffix={
            <Button type="text"
              icon={<SendOutlined style={{ color: inputValue.trim() ? '#3b82f6' : '#4b5563', fontSize: '16px' }} />}
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
            />
          }
        />
      </div>
    </div>
  );
};

export default ChatWindow;

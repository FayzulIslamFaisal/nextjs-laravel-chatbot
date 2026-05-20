import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Avatar, Spin, Typography } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
  showOptions?: boolean; // For showing/hiding option buttons dynamically
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<any>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Default welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        type: 'text',
        text: 'আসসালামু আলাইকুম! আমাদের ই-কমার্স অ্যাসিস্ট্যান্ট চ্যাটে স্বাগতম। আপনি কোন প্রোডাক্টটি খুঁজছেন? দয়া করে প্রোডাক্টের নামটি আমাদের জানান।',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Handle Search API
  const handleSearch = async (productQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/products/search?q=${encodeURIComponent(productQuery)}`);
      const data = await response.json();

      if (data.found && data.product) {
        // Product found
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-found-${Date.now()}`,
            sender: 'bot',
            type: 'text',
            text: `আমরা "${data.product.name}" প্রোডাক্টটি পেয়েছি! নিচে এর বিস্তারিত বিবরণ দেখুন:`,
            timestamp: new Date(),
          },
          {
            id: `bot-product-${Date.now()}`,
            sender: 'bot',
            type: 'product_card',
            product: data.product,
            timestamp: new Date(),
          },
        ]);
      } else {
        // Product not found or out of stock
        const yesNoMessageId = `bot-options-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-notfound-${Date.now()}`,
            sender: 'bot',
            type: 'text',
            text: 'দুঃখিত, এই প্রোডাক্টটি এখন আমাদের স্টকে নেই। আপনি কি অন্য কোনো প্রোডাক্ট সম্পর্কে জানতে চান?',
            timestamp: new Date(),
          },
          {
            id: yesNoMessageId,
            sender: 'bot',
            type: 'options',
            timestamp: new Date(),
            showOptions: true,
          },
        ]);

        // Start 10 seconds auto-timeout timer
        startNoReplyTimer(yesNoMessageId);
      }
    } catch (error) {
      console.error('Error searching product:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          type: 'text',
          text: 'দুঃখিত, সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start the 10 seconds no-reply timer
  const startNoReplyTimer = (optionsMessageId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // Hide the buttons of that message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optionsMessageId ? { ...msg, showOptions: false } : msg))
      );

      // Handle the timeout auto-fallback to related products
      handleNoResponse();
    }, 10000);
  };

  // Fetch and display related products automatically
  const handleNoResponse = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-timeout-text-${Date.now()}`,
        sender: 'bot',
        type: 'text',
        text: 'আপনি কোনো সাড়া দেননি। আমাদের স্টকে থাকা কিছু জনপ্রিয় সম্পর্কিত প্রোডাক্ট নিচে দেখুন:',
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch(`${apiBase}/api/products/related?limit=4`);
      const products = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-related-${Date.now()}`,
          sender: 'bot',
          type: 'related_carousel',
          products: products,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Yes click
  const handleYes = (optionsMessageId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Hide options
    setMessages((prev) =>
      prev.map((msg) => (msg.id === optionsMessageId ? { ...msg, showOptions: false } : msg))
    );

    // Add user response and bot text
    setMessages((prev) => [
      ...prev,
      {
        id: `user-yes-${Date.now()}`,
        sender: 'user',
        type: 'text',
        text: 'হ্যাঁ',
        timestamp: new Date(),
      },
      {
        id: `bot-yes-response-${Date.now()}`,
        sender: 'bot',
        type: 'text',
        text: 'ঠিক আছে, নতুন প্রোডাক্টের নাম বলুন।',
        timestamp: new Date(),
      },
    ]);

    // Focus input field for convenience
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle No click
  const handleNo = async (optionsMessageId: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // Hide options
    setMessages((prev) =>
      prev.map((msg) => (msg.id === optionsMessageId ? { ...msg, showOptions: false } : msg))
    );

    setMessages((prev) => [
      ...prev,
      {
        id: `user-no-${Date.now()}`,
        sender: 'user',
        type: 'text',
        text: 'না',
        timestamp: new Date(),
      },
      {
        id: `bot-no-response-${Date.now()}`,
        sender: 'bot',
        type: 'text',
        text: 'কোনো সমস্যা নেই! আপনি আমাদের এই চমৎকার সম্পর্কিত প্রোডাক্টগুলো দেখতে পারেন:',
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/products/related?limit=4`);
      const products = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-related-${Date.now()}`,
          sender: 'bot',
          type: 'related_carousel',
          products: products,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();

    // Clear any active timers for outstanding yes/no responses if they type something else
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      // Disable any remaining options in view
      setMessages((prev) => prev.map((m) => (m.type === 'options' ? { ...m, showOptions: false } : m)));
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-msg-${Date.now()}`,
        sender: 'user',
        type: 'text',
        text: userText,
        timestamp: new Date(),
      },
    ]);

    setInputValue('');
    handleSearch(userText);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        borderRadius: '24px',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '480px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.1) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Avatar
          icon={<RobotOutlined />}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>ই-কমার্স চ্যাটবট</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <Text style={{ color: '#9ca3af', fontSize: '11px' }}>অনলাইন অ্যাসিস্ট্যান্ট</Text>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((message) => {
          const isBot = message.sender === 'bot';
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: isBot ? 'flex-start' : 'flex-end',
                alignItems: 'flex-start',
                gap: '8px',
                maxWidth: '90%',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
              }}
            >
              {isBot && (
                <Avatar
                  size="small"
                  icon={<RobotOutlined />}
                  style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                {message.type === 'text' && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: isBot ? '0 16px 16px 16px' : '16px 0 16px 16px',
                      background: isBot ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: isBot ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                      color: '#fff',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.text}
                  </div>
                )}

                {message.type === 'product_card' && message.product && (
                  <ProductCard product={message.product} />
                )}

                {message.type === 'related_carousel' && message.products && (
                  <RelatedProductsCarousel products={message.products} />
                )}

                {message.type === 'options' && message.showOptions && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <Button
                      type="primary"
                      onClick={() => handleYes(message.id)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        padding: '4px 20px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      হ্যাঁ
                    </Button>
                    <Button
                      onClick={() => handleNo(message.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        padding: '4px 20px',
                      }}
                    >
                      না
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', color: '#9ca3af', fontSize: '11px' }}>
                      <ClockCircleOutlined />
                      <span>১০ সেকেন্ড</span>
                    </div>
                  </div>
                )}

                <span style={{ color: '#6b7280', fontSize: '9px', alignSelf: isBot ? 'flex-start' : 'flex-end', marginTop: '2px' }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isBot && (
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{ background: '#2563eb', flexShrink: 0 }}
                />
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
            <Avatar size="small" icon={<RobotOutlined />} style={{ background: '#1e293b' }} />
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '0 16px 16px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Spin size="small" />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>চ্যাটবট চিন্তা করছে...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleSend}
          placeholder="প্রোডাক্টের নাম দিয়ে সার্চ করুন..."
          disabled={isLoading}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            padding: '10px 16px',
          }}
          suffix={
            <Button
              type="text"
              icon={<SendOutlined style={{ color: inputValue.trim() ? '#3b82f6' : '#4b5563' }} />}
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

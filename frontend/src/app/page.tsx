'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Tag, Badge, Space, Spin, Button } from 'antd';
import { 
  ShoppingOutlined, 
  MessageOutlined, 
  ApiOutlined, 
  RocketOutlined, 
  SearchOutlined, 
  DatabaseOutlined,
  CommentOutlined,
  CloseOutlined,
  AppstoreOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ChatWindow from '../components/ChatWindow';
import ProductCard from '../components/ProductCard';

const { Title, Paragraph, Text } = Typography;

interface Product {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  in_stock: boolean;
  category?: string;
  description?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [triggerQuery, setTriggerQuery] = useState<string>('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiBase}/api/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChat = (productName: string) => {
    setIsChatOpen(true);
    setTriggerQuery(productName);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
        position: 'relative',
        overflowX: 'hidden',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Decorative blurred background circles for premium look */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.12)',
          filter: 'blur(100px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
        }}
      >
        {/* Top Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <Space align="center" style={{ marginBottom: '10px' }}>
            <Tag
              color="blue"
              style={{
                borderRadius: '20px',
                padding: '4px 14px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(59, 130, 246, 0.1)',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              <RocketOutlined /> Next.js 14 + Laravel 11
            </Tag>
            <Badge status="processing" text="Active API Connection" style={{ color: '#9ca3af', fontSize: '12px' }} />
          </Space>
          <Title
            level={1}
            style={{
              margin: '0 0 10px 0',
              background: 'linear-gradient(to right, #ffffff 30%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '42px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Custom E-commerce Chatbot
          </Title>
          <Paragraph style={{ color: '#9ca3af', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
            আমাদের প্রোডাক্ট কালেকশন থেকে যেকোনো প্রোডাক্টের উপর ক্লিক করলেই চ্যাটবট স্বয়ংক্রিয়ভাবে সেটির বিস্তারিত বিবরণ এবং স্টকের তথ্য দেখাবে।
          </Paragraph>
        </div>

        {/* Dashboard grid with system features and test guide */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            width: '100%',
          }}
        >
          {/* Features Card */}
          <Card
            style={{
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#fff',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={4} style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>
              <ApiOutlined style={{ marginRight: '8px', color: '#3b82f6' }} /> সিস্টেমের গুরুত্বপূর্ণ ফিচারসমূহ
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <SearchOutlined />
                </div>
                <div>
                  <Text strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>রিয়েল-টাইম ডাটাবেজ অনুসন্ধান</Text>
                  <Text style={{ color: '#9ca3af', fontSize: '12px' }}>Laravel API-এর মাধ্যমে প্রোডাক্টের নাম, মূল্য ও স্টক স্ট্যাটাস দ্রুত সার্চ করুন।</Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <MessageOutlined />
                </div>
                <div>
                  <Text strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>ইন্টারেক্টিভ হ্যাঁ/না বাটন অপশন</Text>
                  <Text style={{ color: '#9ca3af', fontSize: '12px' }}>প্রোডাক্ট স্টকে না থাকলে গ্রাহককে বাংলা ভাষায় জিজ্ঞেস করে এবং দ্রুত সিদ্ধান্ত নেওয়ার বাটন দেখায়।</Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <DatabaseOutlined />
                </div>
                <div>
                  <Text strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>অটোমেটিক রিকমেন্ডেশন (Idle Timeout)</Text>
                  <Text style={{ color: '#9ca3af', fontSize: '12px' }}>১০ সেকেন্ড গ্রাহকের কোনো উত্তর না পেলে চ্যাটবট স্বয়ংক্রিয়ভাবে সম্পর্কিত প্রোডাক্টের ক্যারোসেল প্রদর্শন করে।</Text>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Testing Instructions */}
          <Card
            style={{
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#fff',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Title level={4} style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700 }}>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#a855f7' }} /> টেস্ট করার জন্য কী কী লিখে সার্চ করবেন?
            </Title>
            <Paragraph style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
              অটোমেটিক চ্যাট প্রম্পট ট্রিগার করতে নিচের প্রোডাক্টগুলোতে ক্লিক করুন অথবা চ্যাটবক্সে নিচের প্রোডাক্টগুলোর নাম টাইপ করুন:
            </Paragraph>
            <ul style={{ color: '#d1d5db', paddingLeft: '20px', fontSize: '13px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Text code style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#60a5fa', border: 'none' }}>Watch</Text> বা <Text code style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#60a5fa', border: 'none' }}>Headphones</Text>
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>স্টকে থাকা প্রোডাক্ট দেখাবে (Direct Product Card)</div>
              </li>
              <li>
                <Text code style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f472b6', border: 'none' }}>Sunglasses</Text>
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>স্টক আউট প্রোডাক্ট দেখাবে (Product Card with Out-Of-Stock Tag)</div>
              </li>
              <li>
                <Text code style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fca5a5', border: 'none' }}>Laptop</Text> বা <Text code style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fca5a5', border: 'none' }}>Mobile</Text>
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>ডাটাবেজে না থাকায় YES/NO অপশন এবং ১০ সেকেন্ড টাইমার ট্রিগার করবে।</div>
              </li>
            </ul>
          </Card>
        </div>

        {/* Separator / Headline for Products Catalog */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <AppstoreOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
          <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: '22px' }}>
            আমাদের প্রোডাক্ট কালেকশন
          </Title>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(255, 255, 255, 0.05))', marginLeft: '10px' }} />
          <Tag color="blue" style={{ borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
            {products.length} Products
          </Tag>
        </div>

        {/* Products Grid Section */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0' }}>
            <Space direction="vertical" align="center">
              <Spin size="large" />
              <Text style={{ color: '#9ca3af', marginTop: '10px' }}>প্রোডাক্ট লোড হচ্ছে...</Text>
            </Space>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="grid-item">
                <ProductCard product={product} onChat={handleProductChat} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Minimized Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="floating-chat-btn"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.5)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          outline: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {isChatOpen ? (
          <CloseOutlined style={{ fontSize: '26px' }} />
        ) : (
          <Badge count={1} offset={[2, -2]} style={{ backgroundColor: '#10b981', boxShadow: 'none' }}>
            <CommentOutlined style={{ fontSize: '28px', color: '#fff' }} />
          </Badge>
        )}
      </button>

      {/* Floating Expanded Chat Window Container */}
      {isChatOpen && (
        <div className="chat-window-container">
          <ChatWindow
            triggerQuery={triggerQuery}
            onClearTrigger={() => setTriggerQuery('')}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}

      {/* Global CSS Styles for Animations, Layouts, and Responsiveness */}
      <style jsx global>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 30px;
          justify-items: center;
          width: 100%;
          margin-bottom: 60px;
        }

        .grid-item {
          width: 100%;
          display: flex;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .grid-item:hover {
          transform: translateY(-8px);
        }

        .floating-chat-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.7);
        }

        .floating-chat-btn:active {
          transform: scale(0.95);
        }

        .chat-window-container {
          position: fixed;
          bottom: 110px;
          right: 30px;
          z-index: 1000;
          width: 100%;
          max-width: 440px;
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 576px) {
          .chat-window-container {
            bottom: 105px;
            right: 15px;
            left: 15px;
            width: calc(100% - 30px);
            max-width: none;
          }
          
          .floating-chat-btn {
            bottom: 25px !important;
            right: 25px !important;
            width: 58px !important;
            height: 58px !important;
          }
        }
      `}</style>
    </main>
  );
}

'use client';

import React from 'react';
import { Typography, Card, Tag, Badge, Space } from 'antd';
import { 
  ShoppingOutlined, 
  MessageOutlined, 
  ApiOutlined, 
  RocketOutlined, 
  SearchOutlined, 
  DatabaseOutlined 
} from '@ant-design/icons';
import ChatWindow from '../components/ChatWindow';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
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
          <Paragraph style={{ color: '#9ca3af', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            একটি আধুনিক এআই-চালিত চ্যাট অ্যাসিস্ট্যান্ট যা স্টকে থাকা প্রোডাক্ট অনুসন্ধান করতে পারে এবং কোনো প্রোডাক্ট না থাকলে বুদ্ধিমান সম্পর্কিত প্রোডাক্টের পরামর্শ প্রদান করে।
          </Paragraph>
        </div>

        {/* Dashboard Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '30px',
            alignItems: 'start',
          }}
          className="dashboard-grid"
        >
          {/* Responsive Layout wrapper via inline CSS triggers */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '30px',
              width: '100%',
            }}
          >
            {/* Sidebar info */}
            <div
              style={{
                flex: '1 1 350px',
                maxWidth: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
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
                  অ্যাপ্লিকেশনটি পরীক্ষা করার জন্য চ্যাটবক্সে নিচের প্রোডাক্টগুলোর নাম টাইপ করুন:
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

            {/* Chatbot Window column */}
            <div style={{ flex: '1 1 350px', maxWidth: '480px', display: 'flex', justifyContent: 'center' }}>
              <ChatWindow />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard-grid {
          width: 100%;
        }
        @media (max-width: 768px) {
          .dashboard-grid > div {
            flex-direction: column !important;
            align-items: center !important;
          }
          .dashboard-grid > div > div {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}

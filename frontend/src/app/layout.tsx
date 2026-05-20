import React from 'react';

export const metadata = {
  title: 'Premium E-commerce Chatbot',
  description: 'An AI-powered e-commerce chatbot built with Next.js, Ant Design, and Laravel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background-color: #0b0f19;
            font-family: 'Hind Siliguri', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #f3f4f6;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

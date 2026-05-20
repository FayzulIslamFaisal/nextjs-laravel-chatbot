import React from 'react';
import { Card, Tag, Typography, Button } from 'antd';
import { ShoppingCartOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

interface Product {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  in_stock: boolean;
  category?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onChat?: (productName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onChat }) => {
  return (
    <Card
      hoverable
      onClick={() => onChat && onChat(product.name)}
      style={{
        width: '100%',
        maxWidth: '320px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      bodyStyle={{ padding: '16px', color: '#fff' }}
      cover={
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#141414' }}>
          <img
            alt={product.name}
            src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          />
          <Tag
            color={product.category === 'Electronics' ? 'blue' : product.category === 'Fashion' ? 'magenta' : 'purple'}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              borderRadius: '6px',
              fontWeight: 600,
              border: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            {product.category || 'General'}
          </Tag>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <Title level={5} style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 600, lineHeight: 1.3 }}>
            {product.name}
          </Title>
          <Text style={{ color: '#10b981', fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            ${parseFloat(String(product.price)).toFixed(2)}
          </Text>
        </div>

        {product.description && (
          <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 8px 0' }}>
            {product.description}
          </Paragraph>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <div>
            {product.in_stock ? (
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: '6px', fontWeight: 500 }}>
                স্টকে আছে
              </Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: '6px', fontWeight: 500 }}>
                স্টক আউট
              </Tag>
            )}
          </div>

          <Button
            type="primary"
            disabled={!product.in_stock}
            icon={<ShoppingCartOutlined />}
            size="small"
            style={{
              borderRadius: '8px',
              background: product.in_stock ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#4b5563',
              border: 'none',
              fontWeight: 500,
              boxShadow: product.in_stock ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
            }}
          >
            {product.in_stock ? 'কিনুন' : 'অর্ডার করুন'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
export default ProductCard;

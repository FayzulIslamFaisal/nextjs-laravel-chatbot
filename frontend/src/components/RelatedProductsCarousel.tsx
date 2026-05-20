import React from 'react';
import { Carousel, Typography } from 'antd';
import ProductCard from './ProductCard';

const { Title } = Typography;

interface Product {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  in_stock: boolean;
  category?: string;
  description?: string;
}

interface RelatedProductsCarouselProps {
  products: Product[];
}

export const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div
      style={{
        margin: '16px 0',
        padding: '16px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        width: '100%',
        maxWidth: '350px',
      }}
    >
      <Title level={5} style={{ color: '#9ca3af', margin: '0 0 16px 0', fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        সম্পর্কিত প্রোডাক্টসমূহ (Related Products)
      </Title>

      <Carousel
        autoplay
        effect="fade"
        dots={{ className: 'custom-carousel-dots' }}
        style={{
          width: '100%',
        }}
      >
        {products.map((product) => (
          <div key={product.id} style={{ display: 'flex', justifyContent: 'center', paddingBottom: '12px' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>

      <style jsx global>{`
        .custom-carousel-dots li button {
          background: #4b5563 !important;
          height: 4px !important;
          border-radius: 2px !important;
        }
        .custom-carousel-dots li.slick-active button {
          background: #3b82f6 !important;
          width: 24px !important;
        }
      `}</style>
    </div>
  );
};
export default RelatedProductsCarousel;

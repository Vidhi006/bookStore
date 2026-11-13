'use client';

import React from 'react';
import { Modal, Row, Col, Typography, Tag, Rate, Button, Divider, Space, Descriptions } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';

const { Title, Text, Paragraph } = Typography;

export const BookDetailModal: React.FC = () => {
  const { selectedBook, setSelectedBook, addToCart, toggleWishlist, isInWishlist, user } = useBookStore();

  if (!selectedBook) return null;

  const wishlisted = isInWishlist(selectedBook.id);

  return (
    <Modal
      open={!!selectedBook}
      onCancel={() => setSelectedBook(null)}
      footer={null}
      width={720}
      centered
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      <Row gutter={[28, 24]} align="top" style={{ paddingTop: '8px' }}>
        {/* Book Cover */}
        <Col xs={24} sm={10}>
          <div
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(44, 38, 30, 0.12)',
              backgroundColor: '#f4f0e8',
              height: '340px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedBook.coverImage}
              alt={selectedBook.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
        </Col>

        {/* Book Details */}
        <Col xs={24} sm={14}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5', borderRadius: '4px' }}>
              {selectedBook.genre}
            </Tag>
            {selectedBook.badge && (
              <Tag style={{ background: '#f5eee6', color: '#6d4f34', border: '1px solid #decbb8', borderRadius: '4px' }}>
                {selectedBook.badge}
              </Tag>
            )}
          </div>

          <Title
            level={3}
            className="font-serif-title"
            style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#1C1917', fontSize: '22px' }}
          >
            {selectedBook.title}
          </Title>

          <Text type="secondary" style={{ fontSize: '15px', display: 'block', marginBottom: '12px', color: '#7a7065' }}>
            by <strong style={{ color: '#443c34' }}>{selectedBook.author}</strong>
          </Text>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Rate disabled defaultValue={selectedBook.rating} allowHalf style={{ color: '#b87d46' }} />
            <Text strong style={{ color: '#1C1917', fontSize: '14px' }}>
              {selectedBook.rating} / 5.0
            </Text>
          </div>

          <Paragraph style={{ color: '#574d42', fontSize: '14px', lineHeight: 1.6 }}>
            {selectedBook.description}
          </Paragraph>

          <Descriptions column={2} size="small" style={{ margin: '14px 0' }}>
            <Descriptions.Item label="ISBN">{selectedBook.isbn}</Descriptions.Item>
            <Descriptions.Item label="Year">{selectedBook.publishedYear}</Descriptions.Item>
            <Descriptions.Item label="Inventory">
              <Tag color={selectedBook.stock > 0 ? 'success' : 'error'} style={{ borderRadius: '4px' }}>
                {selectedBook.stock > 0 ? `${selectedBook.stock} in stock` : 'Sold out'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Binding">Hardcover Library Edition</Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '16px 0', borderColor: '#e8e4dc' }} />

          {/* Price & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#8c8072' }}>
                Retail Price
              </Text>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917' }}>
                ${selectedBook.price.toFixed(2)}
              </div>
            </div>

            <Space>
              <Button
                size="large"
                icon={
                  wishlisted ? (
                    <HeartFilled style={{ color: '#8a533c' }} />
                  ) : (
                    <HeartOutlined style={{ color: '#574d42' }} />
                  )
                }
                onClick={() => toggleWishlist(selectedBook.id)}
                style={{ borderRadius: '8px', borderColor: '#d9d2c5', color: '#574d42' }}
              >
                {wishlisted ? 'Saved' : 'Wishlist'}
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={selectedBook.stock <= 0}
                onClick={() => {
                  addToCart(selectedBook);
                  if (user && user.isEmailVerified) {
                    setSelectedBook(null);
                  }
                }}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: '#3D5A3E', // Deep Olive
                  borderColor: '#3D5A3E',
                  color: '#fdfbf7',
                  padding: '0 24px',
                  height: '42px',
                }}
              >
                {user ? 'Add to Cart' : 'Sign In to Add'}
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

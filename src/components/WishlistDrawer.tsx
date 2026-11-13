'use client';

import React from 'react';
import { Drawer, List, Button, Typography, Space, Empty, Tag } from 'antd';
import {
  HeartFilled,
  DeleteOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';

const { Text } = Typography;

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    books,
  } = useBookStore();

  const wishlistBooks = books.filter((book) => wishlist.has(book.id));

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <HeartFilled style={{ fontSize: '18px', color: '#8a533c' }} />
            <span className="font-serif-title" style={{ fontWeight: 700, color: '#1C1917', fontSize: '17px' }}>
              Saved Volumes
            </span>
          </Space>
          <Tag style={{ background: '#f5eee6', color: '#6d4f34', border: '1px solid #decbb8', borderRadius: '4px' }}>
            {wishlist.size} saved
          </Tag>
        </div>
      }
      placement="right"
      onClose={() => setIsWishlistOpen(false)}
      open={isWishlistOpen}
      width={420}
    >
      {wishlistBooks.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Empty
            description="Your saved collection is empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={wishlistBooks}
          renderItem={(book) => (
            <List.Item
              style={{ padding: '14px 0', borderBottom: '1px solid #ede8df' }}
              actions={[
                <Button
                  key="cart"
                  type="primary"
                  size="small"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => addToCart(book)}
                  style={{ borderRadius: '6px', background: '#3D5A3E', borderColor: '#3D5A3E', color: '#FAFAF8' }}
                >
                  Add
                </Button>,
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => toggleWishlist(book.id)}
                  title="Remove from saved"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: '48px',
                      height: '64px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#f4f0e8',
                      border: '1px solid #EDEAE3',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                }
                title={
                  <Text strong style={{ fontSize: '14px', color: '#1C1917' }} ellipsis>
                    {book.title}
                  </Text>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#7a7065' }}>
                      {book.author}
                    </Text>
                    <Text strong style={{ color: '#1C1917', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                      ${book.price.toFixed(2)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

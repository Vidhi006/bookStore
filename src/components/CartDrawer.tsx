'use client';

import React from 'react';
import {
  Drawer,
  List,
  Button,
  Typography,
  Space,
  InputNumber,
  Empty,
  Divider,
  Tag,
  Alert,
} from 'antd';
import {
  DeleteOutlined,
  UndoOutlined,
  ArrowRightOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';

const { Title, Text } = Typography;

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    undoRemove,
    canUndo,
    cartTotal,
    cartCount,
    setIsCheckoutOpen,
  } = useBookStore();

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <ShoppingCartOutlined style={{ fontSize: '18px', color: '#3D5A3E' }} />
            <span className="font-serif-title" style={{ fontWeight: 700, color: '#1C1917', fontSize: '17px' }}>
              Your Reading Basket
            </span>
          </Space>
          <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5', borderRadius: '4px' }}>
            {cartCount} items
          </Tag>
        </div>
      }
      placement="right"
      onClose={() => setIsCartOpen(false)}
      open={isCartOpen}
      width={460}
      footer={
        cart.length > 0 ? (
          <div style={{ padding: '8px 0' }}>
            {/* Undo Alert / Button */}
            {canUndo && (
              <Alert
                message="Item was removed"
                description="Click Undo to restore the recently removed volume."
                type="info"
                showIcon
                action={
                  <Button
                    size="small"
                    type="primary"
                    icon={<UndoOutlined />}
                    onClick={undoRemove}
                    style={{ background: '#7B5E3A', borderColor: '#7B5E3A', borderRadius: '4px' }}
                  >
                    Undo
                  </Button>
                }
                style={{ marginBottom: '14px', borderRadius: '8px', border: '1px solid #decbb8', background: '#FAFAF8' }}
              />
            )}

            {/* Price Breakdown */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <Text type="secondary" style={{ color: '#7a7065' }}>Subtotal</Text>
                <Text strong style={{ color: '#1C1917' }}>${cartTotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <Text type="secondary" style={{ color: '#7a7065' }}>Expedited Shipping</Text>
                <Tag style={{ margin: 0, background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5' }}>
                  <CheckCircleOutlined /> FREE
                </Tag>
              </div>
              <Divider style={{ margin: '10px 0', borderColor: '#EDEAE3' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Title level={4} style={{ margin: 0, color: '#1C1917' }}>Order Total</Title>
                <Title level={3} style={{ margin: 0, color: '#3D5A3E', fontWeight: 800 }}>
                  ${cartTotal.toFixed(2)}
                </Title>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              type="primary"
              size="large"
              block
              icon={<ArrowRightOutlined />}
              onClick={handleProceedToCheckout}
              style={{
                borderRadius: '8px',
                height: '46px',
                fontWeight: 600,
                fontSize: '15px',
                background: '#3D5A3E', // Olive green
                borderColor: '#3D5A3E',
                color: '#FAFAF8',
              }}
            >
              Proceed to Checkout (${cartTotal.toFixed(2)})
            </Button>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Empty
            description="Your basket is currently empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              onClick={() => setIsCartOpen(false)}
              style={{ borderRadius: '8px', background: '#3D5A3E', borderColor: '#3D5A3E', color: '#FAFAF8' }}
            >
              Explore Collection
            </Button>
          </Empty>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={cart}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '16px 0',
                borderBottom: '1px solid #ede8df',
              }}
              actions={[
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item.book.id)}
                  title="Remove from cart"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: '60px',
                      height: '80px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#f4f0e8',
                      border: '1px solid #EDEAE3',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
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
                    {item.book.title}
                  </Text>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#7a7065' }}>
                      {item.book.author}
                    </Text>
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <InputNumber
                        min={1}
                        max={item.book.stock}
                        value={item.quantity}
                        onChange={(val) => updateCartQuantity(item.book.id, Number(val) || 1)}
                        size="small"
                        style={{ width: '60px', borderRadius: '4px', borderColor: '#d9d2c5' }}
                      />
                      <Text strong style={{ color: '#1C1917', fontSize: '13px' }}>
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </Text>
                    </div>
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

'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Result, Typography, Divider, Tag } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { Order } from '@/types';

const { Title, Text } = Typography;

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartTotal, placeOrder, user } = useBookStore();
  const [form] = Form.useForm();
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleSubmit = async (values: { name: string; email: string; address: string }) => {
    const order = await placeOrder({
      name: values.name,
      email: values.email,
      address: values.address,
    });
    if (!order) return;
    setCompletedOrder(order);
    form.resetFields();
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCompletedOrder(null);
  };

  return (
    <Modal
      open={isCheckoutOpen}
      onCancel={handleClose}
      footer={null}
      width={540}
      centered
      destroyOnClose
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      {completedOrder ? (
        <Result
          status="success"
          title={<span className="font-serif-title" style={{ color: '#1C1917' }}>Order Confirmed</span>}
          subTitle={`Tracking Reference: ${completedOrder.id}`}
          extra={[
            <div
              key="order-info"
              style={{
                background: '#fcfbfa',
                border: '1px solid #e8e4dc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '15px', color: '#1C1917' }}>
                  Fulfillment Status: {completedOrder.status}
                </Text>
                <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5' }}>
                  Verified Purchase
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '6px', color: '#7a7065' }}>
                Thank you for your order. A receipt has been issued and sent to your email.
              </Text>
              <Divider style={{ margin: '12px 0', borderColor: '#ede8df' }} />
              <div style={{ fontSize: '13px', color: '#443c34' }}>
                <strong>Recipient:</strong> {completedOrder.customerName} ({completedOrder.customerEmail})
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px', color: '#443c34' }}>
                <strong>Destination:</strong> {completedOrder.shippingAddress}
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px', fontWeight: 700, color: '#3D5A3E' }}>
                <strong>Total Amount:</strong> ${completedOrder.totalAmount.toFixed(2)}
              </div>
            </div>,
            <Button
              type="primary"
              size="large"
              key="done"
              onClick={handleClose}
              block
              style={{
                borderRadius: '8px',
                background: '#3D5A3E',
                borderColor: '#3D5A3E',
                fontWeight: 600,
                color: '#fdfbf7',
                height: '44px',
              }}
            >
              Return to Catalog
            </Button>,
          ]}
        />
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <Title level={4} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
              Complete Your Purchase
            </Title>
            <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
              Please enter your shipping and contact information to confirm your order.
            </Text>
          </div>

          <div
            style={{
              padding: '14px 18px',
              background: '#fcfbfa',
              borderRadius: '8px',
              border: '1px solid #e8e4dc',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <Text strong style={{ color: '#1C1917' }}>Order Summary</Text>
              <div style={{ fontSize: '12px', color: '#7a7065' }}>
                {cart.length} volume(s) • Free Expedited Delivery
              </div>
            </div>
            <Title level={4} style={{ margin: 0, color: '#3D5A3E' }}>
              ${cartTotal.toFixed(2)}
            </Title>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: user?.name || '',
              email: user?.email || '',
              address: '742 Evergreen Terrace, Springfield, OR',
            }}
          >
            <Form.Item
              name="name"
              label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Full Name</Text>}
              rules={[{ required: true, message: 'Please enter your full name.' }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: '#8c8072' }} />}
                placeholder="e.g. Jane Austen"
                style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Contact Email</Text>}
              rules={[
                { required: true, message: 'Please enter your email.' },
                { type: 'email', message: 'Enter a valid email address.' },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined style={{ color: '#8c8072' }} />}
                placeholder="jane@example.com"
                style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Delivery Address</Text>}
              rules={[{ required: true, message: 'Please enter your delivery address.' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Street address, city, state, postal code"
                style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                borderRadius: '8px',
                height: '46px',
                fontWeight: 600,
                background: '#3D5A3E', // Olive green
                borderColor: '#3D5A3E',
                color: '#fdfbf7',
                marginTop: '10px',
              }}
            >
              Confirm Order (${cartTotal.toFixed(2)})
            </Button>
          </Form>
        </div>
      )}
    </Modal>
  );
};

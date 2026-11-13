'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Typography,
  Space,
  Result,
} from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { formatPrice } from '@/components/site/SiteBookCard';
import { Order, Genre } from '@/types';

const { Title, Text, Paragraph } = Typography;

export const AdminPanel: React.FC = () => {
  const {
    books,
    addBook,
    orders,
    updateOrderStatus,
    user,
    setIsAuthModalOpen,
    setAuthModalTab,
    setPendingVerificationEmail,
  } = useBookStore();

  const [form] = Form.useForm();

  // Metrics
  const totalStock = books.reduce((acc, b) => acc + b.stock, 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // If not logged in
  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            textAlign: 'center',
            padding: '40px 24px',
            border: '1px solid #e8e4dc',
            background: '#ffffff',
            boxShadow: '0 4px 12px rgba(44, 38, 30, 0.04)',
          }}
        >
          <Result
            icon={<LockOutlined style={{ color: '#3D5A3E', fontSize: '56px' }} />}
            title={<span className="font-serif-title" style={{ color: '#1C1917' }}>Manager Sign In Required</span>}
            subTitle="The Store Management Dashboard is restricted. Please sign in with an authorized account to access inventory and sales records."
            extra={
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                style={{
                  borderRadius: '8px',
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  fontWeight: 600,
                  height: '44px',
                  padding: '0 32px',
                }}
              >
                Sign In to Dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // If logged in but email is unverified
  if (!user.isEmailVerified) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            textAlign: 'center',
            padding: '40px 24px',
            border: '1px solid #decbb8',
            background: '#FAFAF8',
            boxShadow: '0 4px 12px rgba(44, 38, 30, 0.04)',
          }}
        >
          <Result
            icon={<SafetyCertificateOutlined style={{ color: '#8a533c', fontSize: '56px' }} />}
            title={<span className="font-serif-title" style={{ color: '#1C1917' }}>Email Verification Required</span>}
            subTitle={
              <div>
                <Paragraph style={{ fontSize: '15px', color: '#574d42', maxWidth: '520px', margin: '0 auto 12px auto' }}>
                  Your account <strong>{user.email}</strong> is not verified yet.
                  To ensure security, dashboard access requires a verified email address.
                </Paragraph>
              </div>
            }
            extra={
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setPendingVerificationEmail(user.email);
                  setAuthModalTab('verify');
                  setIsAuthModalOpen(true);
                }}
                style={{
                  borderRadius: '8px',
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  fontWeight: 600,
                  height: '44px',
                  padding: '0 28px',
                }}
              >
                Verify Email Now (Enter 6-Digit Code)
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const handleAddBook = (values: {
    title: string;
    author: string;
    isbn: string;
    price: number;
    genre: Genre;
    stock: number;
    description: string;
    coverImage?: string;
  }) => {
    addBook({
      title: values.title,
      author: values.author,
      isbn: values.isbn,
      price: values.price,
      rating: 4.8,
      genre: values.genre,
      stock: values.stock,
      description: values.description,
      publishedYear: new Date().getFullYear(),
      coverImage:
        values.coverImage ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      badge: 'Curated',
    });
    form.resetFields();
  };

  // Orders table columns
  const orderColumns = [
    {
      title: 'Order',
      dataIndex: 'queuePosition',
      key: 'queuePosition',
      render: (pos: number) => (
        <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5', borderRadius: '4px' }}>
          #{pos}
        </Tag>
      ),
    },
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text strong style={{ color: '#1C1917' }}>{id}</Text>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: unknown, record: Order) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1C1917' }}>{record.customerName}</div>
          <Text type="secondary" style={{ fontSize: '12px', color: '#7a7065' }}>
            {record.customerEmail}
          </Text>
        </div>
      ),
    },
    {
      title: 'Volumes Purchased',
      key: 'items',
      render: (_: unknown, record: Order) => (
        <div>
          {record.items.map((item) => (
            <div key={item.book.id} style={{ fontSize: '13px', color: '#443c34' }}>
              • {item.book.title} <Text type="secondary" style={{ color: '#8c8072' }}>(x{item.quantity})</Text>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong style={{ color: '#3D5A3E', fontSize: '14px' }}>
          {formatPrice(amount)}
        </Text>
      ),
    },
    {
      title: 'Fulfillment Status',
      key: 'status',
      render: (_: unknown, record: Order) => (
        <Select
          value={record.status}
          onChange={(newStatus) => updateOrderStatus(record.id, newStatus)}
          style={{ width: '130px' }}
          options={[
            { value: 'Pending', label: '🟡 Pending' },
            { value: 'Processing', label: '🔵 Processing' },
            { value: 'Delivered', label: '🟢 Delivered' },
          ]}
        />
      ),
    },
    {
      title: 'Placed At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => <Text type="secondary" style={{ color: '#8c8072' }}>{time}</Text>,
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 36px' }}>
      {/* Dashboard Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Title level={2} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
            Store Management Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: '14px', color: '#7a7065' }}>
            Authenticated as <strong>{user.name}</strong> ({user.email}) •{' '}
            <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5', borderRadius: '4px' }}>
              <CheckCircleOutlined style={{ marginRight: '4px' }} />
              Verified Administrator
            </Tag>
          </Text>
        </div>
      </div>

      {/* Aesthetic Olive & Warm Brown Metric Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#7a7065', fontSize: '13px' }}>Curated Titles</span>}
              value={books.length}
              prefix={<BookOutlined style={{ color: '#3D5A3E', marginRight: '6px' }} />}
              valueStyle={{ fontWeight: 700, color: '#1C1917' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#7a7065', fontSize: '13px' }}>Inventory Units</span>}
              value={totalStock}
              prefix={<ShoppingOutlined style={{ color: '#5a6f58', marginRight: '6px' }} />}
              valueStyle={{ fontWeight: 700, color: '#1C1917' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#7a7065', fontSize: '13px' }}>Active Orders</span>}
              value={orders.length}
              prefix={<ClockCircleOutlined style={{ color: '#996739', marginRight: '6px' }} />}
              valueStyle={{ fontWeight: 700, color: '#1C1917' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
            }}
          >
            <Statistic
              title={<span style={{ color: '#7a7065', fontSize: '13px' }}>Gross Revenue</span>}
              value={totalRevenue}
              precision={0}
              prefix={<span style={{ color: '#7B5E3A', marginRight: '4px', fontSize: '18px' }}>Rs.</span>}
              valueStyle={{ fontWeight: 700, color: '#1C1917' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[28, 28]}>
        {/* Add New Book Form */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <Space>
                <PlusCircleOutlined style={{ color: '#3D5A3E' }} />
                <span className="font-serif-title" style={{ fontWeight: 700, color: '#1C1917', fontSize: '16px' }}>
                  Add Title to Catalog
                </span>
              </Space>
            }
            style={{
              borderRadius: '14px',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
              background: '#ffffff',
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleAddBook}>
              <Form.Item
                name="title"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Book Title</Text>}
                rules={[{ required: true, message: 'Please enter title' }]}
              >
                <Input placeholder="e.g. Sapiens" style={{ borderRadius: '8px', borderColor: '#d9d2c5' }} />
              </Form.Item>

              <Form.Item
                name="author"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Author</Text>}
                rules={[{ required: true, message: 'Please enter author' }]}
              >
                <Input placeholder="e.g. Yuval Noah Harari" style={{ borderRadius: '8px', borderColor: '#d9d2c5' }} />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="isbn"
                    label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>ISBN</Text>}
                    rules={[{ required: true, message: 'Enter ISBN' }]}
                  >
                    <Input placeholder="978-0062316097" style={{ borderRadius: '8px', borderColor: '#d9d2c5' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="genre"
                    label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Genre</Text>}
                    initialValue="Fiction"
                    rules={[{ required: true }]}
                  >
                    <Select
                      style={{ borderRadius: '8px' }}
                      options={[
                        { value: 'Fiction', label: 'Fiction' },
                        { value: 'Sci-Fi', label: 'Sci-Fi' },
                        { value: 'Self-Help', label: 'Self-Help' },
                        { value: 'Science', label: 'Science' },
                        { value: 'Mystery', label: 'Mystery' },
                        { value: 'Classic', label: 'Classic' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Price (Rs.)</Text>}
                    initialValue={499}
                    rules={[{ required: true, message: 'Price required' }]}
                  >
                    <InputNumber min={1} max={99999} step={1} style={{ width: '100%', borderRadius: '8px' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Stock Units</Text>}
                    initialValue={20}
                    rules={[{ required: true, message: 'Stock required' }]}
                  >
                    <InputNumber min={1} max={500} style={{ width: '100%', borderRadius: '8px' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Synopsis & Notes</Text>}
                initialValue="A critically acclaimed work of literature exploring essential human ideas."
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={3} style={{ borderRadius: '8px', borderColor: '#d9d2c5' }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                icon={<PlusCircleOutlined />}
                style={{
                  borderRadius: '8px',
                  background: '#3D5A3E', // Olive green
                  borderColor: '#3D5A3E',
                  fontWeight: 600,
                  color: '#FAFAF8',
                  height: '42px',
                }}
              >
                Save Volume to Inventory
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Customer Orders Table */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-serif-title" style={{ fontWeight: 700, color: '#1C1917', fontSize: '16px' }}>
                  Customer Order Fulfillment
                </span>
                <Tag style={{ background: '#edf2ec', color: '#364935', border: '1px solid #c8d8c5', borderRadius: '4px' }}>
                  {orders.length} Orders
                </Tag>
              </div>
            }
            style={{
              borderRadius: '14px',
              border: '1px solid #e8e4dc',
              boxShadow: '0 2px 8px rgba(44, 38, 30, 0.03)',
              background: '#ffffff',
            }}
          >
            {orders.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Paragraph type="secondary" style={{ color: '#8c8072' }}>
                  No customer orders have been placed yet. Place an order from the store catalog to test fulfillment tracking.
                </Paragraph>
              </div>
            ) : (
              <Table
                dataSource={orders}
                columns={orderColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

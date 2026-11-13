'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Alert,
  Tag,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';

const { Title, Text } = Typography;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    latestDispatchedCode,
    login,
    signup,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationCode,
  } = useBookStore();

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [verifyForm] = Form.useForm();
  const [forgotForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  // Handle countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Sync pending verification email into forms
  useEffect(() => {
    if (pendingVerificationEmail) {
      verifyForm.setFieldsValue({ email: pendingVerificationEmail });
      resetForm.setFieldsValue({ email: pendingVerificationEmail });
    }
  }, [pendingVerificationEmail, verifyForm, resetForm]);

  const handleAutoFillCode = (code: string) => {
    verifyForm.setFieldsValue({ code });
    resetForm.setFieldsValue({ code });
  };

  // Handlers
  const handleLoginSubmit = async (values: { email: string; pass: string }) => {
    setLoading(true);
    await login(values.email, values.pass);
    setLoading(false);
  };

  const handleSignupSubmit = async (values: { name: string; email: string; pass: string }) => {
    setLoading(true);
    const result = await signup(values.name, values.email, values.pass);
    setLoading(false);
    if (result.success && result.emailSent !== false) {
      setResendCooldown(30);
    }
  };

  const handleVerifySubmit = async (values: { email: string; code: string }) => {
    setLoading(true);
    await verifyEmail(values.email || pendingVerificationEmail, values.code);
    setLoading(false);
  };

  const handleForgotSubmit = async (values: { email: string }) => {
    setLoading(true);
    const result = await forgotPassword(values.email);
    setLoading(false);
    if (result.success) {
      setResendCooldown(30);
    }
  };

  const handleResetSubmit = async (values: { email: string; code: string; newPass: string }) => {
    setLoading(true);
    await resetPassword(values.email || pendingVerificationEmail, values.code, values.newPass);
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !pendingVerificationEmail) return;
    setLoading(true);
    const res = await resendVerificationCode(pendingVerificationEmail);
    setLoading(false);
    if (res.success) {
      setResendCooldown(30);
    }
  };

  const handleQuickDemo = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      loginForm.setFieldsValue({
        email: 'admin@bookhaven.com',
        pass: 'admin123',
      });
    } else {
      loginForm.setFieldsValue({
        email: 'customer@bookhaven.com',
        pass: 'customer123',
      });
    }
  };

  return (
    <Modal
      open={isAuthModalOpen}
      onCancel={() => setIsAuthModalOpen(false)}
      footer={null}
      width={460}
      centered
      destroyOnClose
      style={{ borderRadius: '16px', overflow: 'hidden' }}
    >
      <div style={{ padding: '8px 4px' }}>
        {/* VIEW 1: SIGN IN */}
        {authModalTab === 'login' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#3D5A3E', // Olive green
                  color: '#FAFAF8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '22px',
                  margin: '0 auto 12px auto',
                }}
              >
                <LockOutlined />
              </div>
              <Title level={3} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Welcome to BookHaven
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
                Sign in to manage your collection and purchase books.
              </Text>
            </div>

            <Form form={loginForm} layout="vertical" onFinish={handleLoginSubmit} requiredMark={false}>
              <Form.Item
                name="email"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Email Address</Text>}
                rules={[
                  { required: true, message: 'Please enter your email.' },
                  { type: 'email', message: 'Enter a valid email address.' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined style={{ color: '#8c8072' }} />}
                  placeholder="name@example.com"
                  style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Form.Item
                name="pass"
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text strong style={{ fontSize: '13px', color: '#443c34' }}>Password</Text>
                    <a
                      onClick={() => setAuthModalTab('forgot')}
                      style={{ fontSize: '12px', color: '#7B5E3A' }}
                    >
                      Forgot password?
                    </a>
                  </div>
                }
                rules={[{ required: true, message: 'Please enter your password.' }]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: '#8c8072' }} />}
                  placeholder="••••••••"
                  style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  fontWeight: 600,
                  background: '#3D5A3E', // Olive
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  marginTop: '8px',
                }}
              >
                Sign In
              </Button>
            </Form>

            <Divider plain style={{ margin: '20px 0', fontSize: '12px', color: '#8c8072' }}>
              Quick Demo Login
            </Divider>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button
                size="middle"
                icon={<ThunderboltOutlined style={{ color: '#7B5E3A' }} />}
                onClick={() => handleQuickDemo('admin')}
                style={{ borderRadius: '8px', fontSize: '12px', borderColor: '#d9d2c5', color: '#443c34' }}
              >
                Fill Manager (Admin)
              </Button>
              <Button
                size="middle"
                icon={<UserOutlined style={{ color: '#3D5A3E' }} />}
                onClick={() => handleQuickDemo('customer')}
                style={{ borderRadius: '8px', fontSize: '12px', borderColor: '#d9d2c5', color: '#443c34' }}
              >
                Fill Reader
              </Button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
                New to BookHaven?{' '}
                <a
                  onClick={() => setAuthModalTab('signup')}
                  style={{ fontWeight: 600, color: '#7B5E3A' }}
                >
                  Create an account
                </a>
              </Text>
            </div>
          </div>
        )}

        {/* VIEW 2: SIGN UP */}
        {authModalTab === 'signup' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#7B5E3A', // Warm Brown
                  color: '#FAFAF8',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '22px',
                  margin: '0 auto 12px auto',
                }}
              >
                <UserOutlined />
              </div>
              <Title level={3} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Join BookHaven
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
                Create your reader account to start saving and purchasing books.
              </Text>
            </div>

            <Form form={signupForm} layout="vertical" onFinish={handleSignupSubmit} requiredMark={false}>
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
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Email Address</Text>}
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
                name="pass"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Password</Text>}
                rules={[
                  { required: true, message: 'Please enter a password.' },
                  { min: 6, message: 'Password must be at least 6 characters.' },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: '#8c8072' }} />}
                  placeholder="Minimum 6 characters"
                  style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  fontWeight: 600,
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  marginTop: '8px',
                }}
              >
                Create Account & Send Verification
              </Button>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
                Already registered?{' '}
                <a
                  onClick={() => setAuthModalTab('login')}
                  style={{ fontWeight: 600, color: '#7B5E3A' }}
                >
                  Sign In
                </a>
              </Text>
            </div>
          </div>
        )}

        {/* VIEW 3: VERIFY EMAIL */}
        {authModalTab === 'verify' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#edf2ec',
                  color: '#3D5A3E',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  margin: '0 auto 12px auto',
                  border: '1px solid #c8d8c5',
                }}
              >
                <SafetyCertificateOutlined />
              </div>
              <Title level={3} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Verify Your Email
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '6px', color: '#7a7065' }}>
                Enter the 6-digit code sent to:
              </Text>
              <Tag style={{ background: '#f5eee6', color: '#6d4f34', border: '1px solid #decbb8', fontSize: '13px', padding: '4px 10px', marginTop: '6px' }}>
                {pendingVerificationEmail || 'your email'}
              </Tag>
            </div>

            {/* In-Modal Verification Code Notification */}
            <Alert
              message="Check your email inbox"
              description="A 6-digit verification code has been dispatched to your email. Enter the code below to verify your account."
              type="info"
              showIcon
              style={{ marginBottom: '18px', borderRadius: '8px', border: '1px solid #c8d8c5', background: '#fbfaf7' }}
            />

            <Form
              form={verifyForm}
              layout="vertical"
              onFinish={handleVerifySubmit}
              initialValues={{ email: pendingVerificationEmail }}
              requiredMark={false}
            >
              <Form.Item name="email" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="code"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>6-Digit Verification Code</Text>}
                rules={[
                  { required: true, message: 'Please enter the 6-digit code.' },
                  { len: 6, message: 'Code must be exactly 6 digits.' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  style={{
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '20px',
                    letterSpacing: '6px',
                    fontWeight: 700,
                    borderColor: '#d9d2c5',
                  }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  fontWeight: 600,
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  marginTop: '8px',
                }}
              >
                Verify & Unlock Full Access
              </Button>
            </Form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <Button
                type="link"
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={() => setAuthModalTab('login')}
                style={{ padding: 0, color: '#7B5E3A' }}
              >
                Back to Sign In
              </Button>

              <Button
                type="link"
                size="small"
                icon={<SendOutlined />}
                disabled={resendCooldown > 0}
                onClick={handleResend}
                style={{ padding: 0, color: '#3D5A3E' }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 4: FORGOT PASSWORD */}
        {authModalTab === 'forgot' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#f5eee6',
                  color: '#7B5E3A',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '22px',
                  margin: '0 auto 12px auto',
                }}
              >
                <KeyOutlined />
              </div>
              <Title level={3} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Reset Your Password
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '4px', color: '#7a7065' }}>
                Enter your registered email and we will issue a secure 6-digit reset code.
              </Text>
            </div>

            <Form form={forgotForm} layout="vertical" onFinish={handleForgotSubmit} requiredMark={false}>
              <Form.Item
                name="email"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Registered Email Address</Text>}
                rules={[
                  { required: true, message: 'Please enter your email.' },
                  { type: 'email', message: 'Enter a valid email address.' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined style={{ color: '#8c8072' }} />}
                  placeholder="name@example.com"
                  style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  fontWeight: 600,
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  marginTop: '8px',
                }}
              >
                Send Password Reset Code
              </Button>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a
                onClick={() => setAuthModalTab('login')}
                style={{ fontSize: '13px', color: '#7B5E3A' }}
              >
                <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Sign In
              </a>
            </div>
          </div>
        )}

        {/* VIEW 5: RESET PASSWORD */}
        {authModalTab === 'reset' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#f5eee6',
                  color: '#7B5E3A',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '22px',
                  margin: '0 auto 12px auto',
                }}
              >
                <LockOutlined />
              </div>
              <Title level={3} className="font-serif-title" style={{ margin: 0, fontWeight: 700, color: '#1C1917' }}>
                Set New Password
              </Title>
              <Text type="secondary" style={{ fontSize: '13px', color: '#7a7065' }}>
                Enter the reset code sent to <strong>{pendingVerificationEmail}</strong> and your new password.
              </Text>
            </div>

            <Alert
              message="Password reset code sent"
              description="Enter the 6-digit code received in your email along with your new password."
              type="info"
              showIcon
              style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #decbb8', background: '#FAFAF8' }}
            />

            <Form
              form={resetForm}
              layout="vertical"
              onFinish={handleResetSubmit}
              initialValues={{ email: pendingVerificationEmail }}
              requiredMark={false}
            >
              <Form.Item name="email" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="code"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>Reset Code</Text>}
                rules={[{ required: true, message: 'Please enter the reset code.' }]}
              >
                <Input
                  size="large"
                  placeholder="6-digit reset code"
                  maxLength={6}
                  style={{ borderRadius: '8px', textAlign: 'center', fontWeight: 700, borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Form.Item
                name="newPass"
                label={<Text strong style={{ fontSize: '13px', color: '#443c34' }}>New Password</Text>}
                rules={[
                  { required: true, message: 'Please enter your new password.' },
                  { min: 6, message: 'Must be at least 6 characters.' },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined style={{ color: '#8c8072' }} />}
                  placeholder="Minimum 6 characters"
                  style={{ borderRadius: '8px', borderColor: '#d9d2c5' }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  borderRadius: '8px',
                  height: '44px',
                  fontWeight: 600,
                  background: '#3D5A3E',
                  borderColor: '#3D5A3E',
                  color: '#FAFAF8',
                  marginTop: '8px',
                }}
              >
                Update Password & Verify
              </Button>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a
                onClick={() => setAuthModalTab('login')}
                style={{ fontSize: '13px', color: '#7B5E3A' }}
              >
                <ArrowLeftOutlined style={{ marginRight: '6px' }} /> Back to Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, List, Tag, Typography, Button, Space, Empty, Tooltip } from 'antd';
import { MailOutlined, CopyOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { DispatchedEmail } from '@/types';
import { useBookStore } from '@/context/BookStoreContext';
import { authService } from '@/services/authService';

const { Text, Title, Paragraph } = Typography;

interface EmailInboxDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const EmailInboxDrawer: React.FC<EmailInboxDrawerProps> = ({ open, onClose }) => {
  const [emails, setEmails] = useState<DispatchedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const { setPendingVerificationEmail, setLatestDispatchedCode, setAuthModalTab, setIsAuthModalOpen } = useBookStore();

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const { data } = await authService.getInbox();
      setEmails(data.emails || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmails();
    }
  }, [open]);

  const handleUseCode = (email: DispatchedEmail) => {
    setPendingVerificationEmail(email.to);
    setLatestDispatchedCode(email.code);
    if (email.type === 'verification') {
      setAuthModalTab('verify');
    } else {
      setAuthModalTab('reset');
    }
    setIsAuthModalOpen(true);
    onClose();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Space>
            <MailOutlined style={{ color: '#2563eb', fontSize: '18px' }} />
            <span style={{ fontWeight: 700 }}>Simulated Email Server Dispatches</span>
          </Space>
          <Button
            size="small"
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchEmails}
          >
            Refresh
          </Button>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={460}
    >
      <div style={{ marginBottom: '16px' }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          This drawer captures real-time verification and password reset emails sent by the backend auth API.
        </Text>
      </div>

      {emails.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Empty description="No emails dispatched yet. Sign up or request a password reset to generate one." />
        </div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={emails}
          renderItem={(email) => (
            <div
              key={email.id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <Tag color={email.type === 'verification' ? 'blue' : 'gold'}>
                    {email.type === 'verification' ? 'Email Verification' : 'Password Reset'}
                  </Tag>
                  <Text strong style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
                    {email.subject}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {email.timestamp}
                </Text>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                <strong>To:</strong> {email.to}
              </div>

              <Paragraph
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  background: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '12px',
                }}
              >
                {email.preview}
              </Paragraph>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Code:</Text>
                  <Tag color="green" style={{ fontSize: '14px', fontWeight: 700, padding: '2px 8px' }}>
                    {email.code}
                  </Tag>
                </div>

                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUseCode(email)}
                  style={{ borderRadius: '6px', fontSize: '12px', background: '#0f172a', borderColor: '#0f172a' }}
                >
                  Apply Code in Auth
                </Button>
              </div>
            </div>
          )}
        />
      )}
    </Drawer>
  );
};


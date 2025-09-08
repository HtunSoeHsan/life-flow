'use client';

import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Tabs, 
  Divider,
  InputNumber,
  TimePicker,
  Upload,
  message,
  Alert,
  Table,
  Tag,
  Modal,
  Space,
  Progress,
  Badge
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
  BellOutlined,
  DatabaseOutlined,
  CloudOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  KeyOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([
    {
      key: 1,
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@bloodbank.com',
      role: 'Administrator',
      status: 'Active',
      lastLogin: '2024-01-15 14:30',
      permissions: ['All']
    },
    {
      key: 2,
      username: 'doctor1',
      name: 'Dr. Sarah Wilson',
      email: 'sarah@bloodbank.com',
      role: 'Doctor',
      status: 'Active',
      lastLogin: '2024-01-15 13:45',
      permissions: ['View Donors', 'Manage Requests', 'View Reports']
    },
    {
      key: 3,
      username: 'technician1',
      name: 'John Smith',
      email: 'john@bloodbank.com',
      role: 'Lab Technician',
      status: 'Active',
      lastLogin: '2024-01-15 12:20',
      permissions: ['Manage Inventory', 'Process Collections', 'Quality Control']
    }
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Settings saved successfully!');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: 'User Info',
      key: 'userInfo',
      render: (record: any) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-gray-500">{record.username}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={
          role === 'Administrator' ? 'red' :
          role === 'Doctor' ? 'blue' :
          role === 'Lab Technician' ? 'green' : 'default'
        }>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'Active' ? 'success' : 'error'} 
          text={status} 
        />
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small">Edit</Button>
          <Button type="link" size="small">Reset Password</Button>
          <Button type="link" size="small" danger>Deactivate</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">System Settings</h2>
            <p className="text-gray-500">Configure system preferences and security settings</p>
          </div>
          <Button 
            type="primary" 
            loading={loading}
            onClick={handleSaveSettings}
          >
            Save All Changes
          </Button>
        </div>
      </Card>

      
<Tabs activeKey={activeTab} onChange={setActiveTab} items={[
  {
    key: 'general',
    label: 'General Settings',
    children: (
      <Row gutter={[24, 24]}>
        {/* Your existing General Settings content */}
        <Col span={12}>
          <Card title="Organization Information">
            {/* Form fields here */}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="System Preferences">
            {/* Form fields here */}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Business Hours">
            {/* Business hours content */}
          </Card>
        </Col>
      </Row>
    ),
  },
  {
    key: 'users',
    label: 'User Management',
    children: (
      <Row gutter={[24, 24]}>
        {/* Your User Management content */}
      </Row>
    ),
  },
  {
    key: 'notifications',
    label: 'Notifications',
    children: (
      <Row gutter={[24, 24]}>
        {/* Your Notification content */}
      </Row>
    ),
  },
  {
    key: 'backup',
    label: 'Data & Backup',
    children: (
      <Row gutter={[24, 24]}>
        {/* Your Backup content */}
      </Row>
    ),
  },
  {
    key: 'health',
    label: 'System Health',
    children: (
      <Row gutter={[24, 24]}>
        {/* Your System Health content */}
      </Row>
    ),
  },
]} />
      {/* Add User Modal */}
      <Modal
        title="Add New User"
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        footer={null}
        width={600}
      >
        
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Full Name" required>
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Username" required>
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" required>
                <Input type="email" placeholder="Enter email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Role" required>
                <Select placeholder="Select role">
                  <Option value="administrator">Administrator</Option>
                  <Option value="doctor">Doctor</Option>
                  <Option value="technician">Lab Technician</Option>
                  <Option value="nurse">Nurse</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Temporary Password" required>
            <Input.Password placeholder="Enter temporary password" />
          </Form.Item>
          <Form.Item label="Permissions">
            <Select mode="multiple" placeholder="Select permissions">
              <Option value="view_donors">View Donors</Option>
              <Option value="manage_donors">Manage Donors</Option>
              <Option value="view_inventory">View Inventory</Option>
              <Option value="manage_inventory">Manage Inventory</Option>
              <Option value="view_requests">View Requests</Option>
              <Option value="manage_requests">Manage Requests</Option>
              <Option value="view_reports">View Reports</Option>
              <Option value="system_settings">System Settings</Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowUserModal(false)}>Cancel</Button>
            <Button type="primary">Create User</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Button, message, Table, Modal, Form, Input, Select, Space } from 'antd';
import { 
  DashboardOutlined, 
  BankOutlined, 
  BarChartOutlined,
  LogoutOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AuditLogs from '@/components/audit/AuditLogs';

const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [showEditHospital, setShowEditHospital] = useState(false);
  const [editForm] = Form.useForm();
  const [hospitalUsers, setHospitalUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm] = Form.useForm();
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [selectedHospitalForUsers, setSelectedHospitalForUsers] = useState(null);
  
  // Search and filter states
  const [hospitalSearchText, setHospitalSearchText] = useState('');
  const [hospitalStatusFilter, setHospitalStatusFilter] = useState('all');
  const [userSearchText, setUserSearchText] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedHospitalForAudit, setSelectedHospitalForAudit] = useState(null);

  const fetchHospitalUsers = async (hospitalId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/hospitals/${hospitalId}/users`);
      const data = await response.json();
      if (data.success) {
        setHospitalUsers(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  const handleAddUser = async (values: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/${selectedHospitalForUsers.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('User added successfully');
        setShowAddUser(false);
        fetchHospitalUsers(selectedHospitalForUsers.id);
      } else {
        message.error(data.error || 'Failed to add user');
      }
    } catch (error) {
      message.error('Failed to add user');
    }
  };

  const handleEditUser = async (values: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/${selectedHospitalForUsers.id}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('User updated successfully');
        setShowEditUser(false);
        fetchHospitalUsers(selectedHospitalForUsers.id);
      } else {
        message.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const handleResetPassword = async (values: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/${selectedHospitalForUsers.id}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.newPassword })
      });

      const data = await response.json();
      if (data.success) {
        message.success('Password reset successfully');
        setShowResetPassword(false);
        resetPasswordForm.resetFields();
        fetchHospitalUsers(selectedHospitalForUsers.id);
      } else {
        message.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      message.error('Failed to reset password');
    }
  };
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      router.push('/login');
      return;
    }

    const authData = JSON.parse(auth);
    if (authData.user.role !== 'super_admin') {
      router.push('/login');
      return;
    }

    fetchHospitals();
  }, [router]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/hospitals');
      const data = await response.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (error) {
      message.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async (values: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('Hospital added successfully');
        setShowAddHospital(false);
        fetchHospitals();
      } else {
        message.error(data.error || 'Failed to add hospital');
      }
    } catch (error) {
      message.error('Failed to add hospital');
    }
  };
 
  const handleEditHospital = async (values: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/hospitals/${selectedHospital.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      if (data.success) {
        message.success('Hospital updated successfully');
        setShowEditHospital(false);
        fetchHospitals();
      } else {
        message.error(data.error || 'Failed to update hospital');
      }
    } catch (error) {
      message.error('Failed to update hospital');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    message.success('Logged out successfully');
    router.push('/login');
  };

  // Filtered data
  const filteredHospitals = hospitals.filter((hospital: any) => {
    const matchesSearch = hospital.name.toLowerCase().includes(hospitalSearchText.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(hospitalSearchText.toLowerCase());
    const matchesStatus = hospitalStatusFilter === 'all' || 
                         (hospitalStatusFilter === 'active' && hospital.isActive) ||
                         (hospitalStatusFilter === 'inactive' && !hospital.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = hospitalUsers.filter((user: any) => {
    const matchesSearch = user.firstName.toLowerCase().includes(userSearchText.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(userSearchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchText.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'all' || 
                         (userStatusFilter === 'active' && user.isActive) ||
                         (userStatusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'hospitals', icon: <BankOutlined />, label: 'Hospital Management' },
    { key: 'analytics', icon: <BarChartOutlined />, label: 'System Analytics' },
    { key: 'users', icon: <UserOutlined />, label: 'User Management' },
    { key: 'audit', icon: <FileTextOutlined />, label: 'Audit Logs' },
  ];

  const hospitalColumns = [
    {
      title: 'Hospital Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Location',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={isActive ? 'text-green-600' : 'text-red-600'}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <div className="space-x-2">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedHospital(record);
              setShowHospitalDetails(true);
            }}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedHospital(record);
              editForm.setFieldsValue(record);
              setShowEditHospital(true);
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'hospitals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Hospital Management</h3>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowAddHospital(true)}
              >
                Add Hospital
              </Button>
            </div>
            
            <Card>
              <div className="mb-4 flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Search hospitals..."
                    prefix={<SearchOutlined />}
                    value={hospitalSearchText}
                    onChange={(e) => setHospitalSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Select
                    placeholder="Filter by status"
                    value={hospitalStatusFilter}
                    onChange={setHospitalStatusFilter}
                    style={{ width: 150 }}
                  >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </Space>
                <span className="text-gray-500">
                  Showing {filteredHospitals.length} of {hospitals.length} hospitals
                </span>
              </div>
              
              <Table
                columns={hospitalColumns}
                dataSource={filteredHospitals}
                loading={loading}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} hospitals`
                }}
              />
            </Card>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">System Analytics</h3>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Blood Units (All Hospitals)"
                    value={245}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Donors"
                    value={1284}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Monthly Collections"
                    value={89}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">User Management</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Select Hospital:</span>
                    <Select
                      placeholder="Choose a hospital"
                      style={{ width: 300 }}
                      value={selectedHospitalForUsers?.id}
                      onChange={(hospitalId) => {
                        const hospital = hospitals.find(h => h.id === hospitalId);
                        setSelectedHospitalForUsers(hospital);
                        if (hospital) {
                          fetchHospitalUsers(hospitalId);
                        }
                      }}
                    >
                      {hospitals.map(hospital => (
                        <Select.Option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddUser(true)}
                    disabled={!selectedHospitalForUsers}
                    className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md"
                  >
                    Add New User
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <div className="mb-4 flex justify-between items-center">
                <Space size="middle">
                  <Input
                    placeholder="Search users..."
                    prefix={<SearchOutlined />}
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Select
                    placeholder="Filter by role"
                    value={userRoleFilter}
                    onChange={setUserRoleFilter}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="all">All Roles</Select.Option>
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="staff">Staff</Select.Option>
                  </Select>
                  <Select
                    placeholder="Filter by status"
                    value={userStatusFilter}
                    onChange={setUserStatusFilter}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                  </Select>
                </Space>
                <span className="text-gray-500">
                  Showing {filteredUsers.length} of {hospitalUsers.length} users
                </span>
              </div>
              
              <Table
                columns={[
                  { 
                    title: 'User', 
                    render: (record: any) => (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {record.firstName} {record.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{record.email}</div>
                        </div>
                      </div>
                    ),
                    width: '30%'
                  },
                  { 
                    title: 'Role', 
                    dataIndex: 'role',
                    render: (role: string) => (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        role === 'staff' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    ),
                    width: '15%'
                  },
                  { 
                    title: 'Contact', 
                    dataIndex: 'phone',
                    render: (phone: string) => (
                      <span className="text-gray-600">{phone || 'N/A'}</span>
                    ),
                    width: '15%'
                  },
                  { 
                    title: 'Status', 
                    dataIndex: 'isActive',
                    render: (isActive: boolean) => (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    ),
                    width: '15%'
                  },
                  { 
                    title: 'Joined', 
                    dataIndex: 'createdAt',
                    render: (date: string) => (
                      <span className="text-gray-600">
                        {new Date(date).toLocaleDateString()}
                      </span>
                    ),
                    width: '15%'
                  },
                  {
                    title: 'Actions',
                    render: (record: any) => (
                      <div className="flex space-x-2">
                        <Button 
                          type="text" 
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setSelectedUser(record);
                            userForm.setFieldsValue(record);
                            setShowEditUser(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                        <Button 
                          type="text" 
                          size="small"
                          onClick={() => {
                            setSelectedUser(record);
                            setShowResetPassword(true);
                          }}
                          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                        >
                          Reset Password
                        </Button>
                      </div>
                    ),
                    width: '10%'
                  }
                ]}
                dataSource={filteredUsers}
                loading={loading}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
                }}
                className="border-0"
              />
            </Card>
          </div>
        );
      
      case 'audit':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">System Audit Logs</h3>
              <Select
                placeholder="Select Hospital"
                style={{ width: 300 }}
                value={selectedHospitalForAudit?.id}
                onChange={(hospitalId) => {
                  const hospital = hospitals.find(h => h.id === hospitalId);
                  setSelectedHospitalForAudit(hospital);
                }}
                allowClear
              >
                {hospitals.map(hospital => (
                  <Select.Option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <AuditLogs hospitalId={selectedHospitalForAudit?.id} />
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Hospitals"
                    value={hospitals.length}
                    prefix={<BankOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Active Hospitals"
                    value={hospitals.filter((h: any) => h.isActive).length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Blood Units"
                    value={245}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="System Users"
                    value={89}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className="p-4 text-white text-center font-bold">
          {collapsed ? 'LF' : 'LifeFlow Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mr-4"
            />
            <h2 className="text-lg font-semibold m-0">
              Super Admin Dashboard - Multi-Tenant Management
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Super Admin</span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>
        
        <Content className="m-6">
          {renderContent()}
        </Content>
      </Layout>

      <Modal
        title="Add New Hospital"
        open={showAddHospital}
        onCancel={() => setShowAddHospital(false)}
        footer={null}
      >
        <Form onFinish={handleAddHospital} layout="vertical">
          <Form.Item name="name" label="Hospital Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="licenseNo" label="License Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Hospital
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Hospital Details"
        open={showHospitalDetails}
        onCancel={() => setShowHospitalDetails(false)}
        footer={null}
        width={600}
      >
        {selectedHospital && (
          <div className="space-y-4">
            <div><strong>Name:</strong> {selectedHospital.name}</div>
            <div><strong>Address:</strong> {selectedHospital.address}</div>
            <div><strong>Phone:</strong> {selectedHospital.phone}</div>
            <div><strong>Email:</strong> {selectedHospital.email}</div>
            <div><strong>License No:</strong> {selectedHospital.licenseNo}</div>
            <div><strong>Contact Person:</strong> {selectedHospital.contactPerson}</div>
            <div><strong>Status:</strong> 
              <span className={selectedHospital.isActive ? 'text-green-600' : 'text-red-600'}>
                {selectedHospital.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div><strong>Created:</strong> {new Date(selectedHospital.createdAt).toLocaleDateString()}</div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button 
                type="primary" 
                size="large"
                icon={<UserOutlined />}
                onClick={() => {
                  setShowHospitalDetails(false);
                  setSelectedMenu('users');
                }}
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-md"
              >
                Manage Users
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Edit Hospital"
        open={showEditHospital}
        onCancel={() => setShowEditHospital(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEditHospital} layout="vertical">
          <Form.Item name="name" label="Hospital Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="licenseNo" label="License Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Contact Person" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Hospital
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add New User"
        open={showAddUser}
        onCancel={() => setShowAddUser(false)}
        footer={null}
      >
        <Form onFinish={handleAddUser} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add User
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit User"
        open={showEditUser}
        onCancel={() => setShowEditUser(false)}
        footer={null}
      >
        <Form form={userForm} onFinish={handleEditUser} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="staff">Staff</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update User
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reset Password"
        open={showResetPassword}
        onCancel={() => {
          setShowResetPassword(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <div className="mb-4">
          <p>Reset password for: <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong></p>
        </div>
        <Form form={resetPasswordForm} onFinish={handleResetPassword} layout="vertical">
          <Form.Item 
            name="newPassword" 
            label="New Password" 
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item 
            name="confirmPassword" 
            label="Confirm Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
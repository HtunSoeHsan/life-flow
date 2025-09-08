'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Button, message } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  MedicineBoxOutlined,
  BarChartOutlined,
  LogoutOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import BloodInventory from '@/components/inventory/BloodInventory';
import DonorManagement from '@/components/donor/DonorManagement';
import CollectionProcessing from '@/components/collection/CollectionProcessing';
import IssueDistribution from '@/components/distribution/IssueDistribution';

const { Header, Sider, Content } = Layout;

export default function HospitalDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [hospitalData, setHospitalData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalBloodUnits: 0,
    activeDonors: 0,
    collectionsToday: 0,
    distributions: 0
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      router.push('/login');
      return;
    }

    const authData = JSON.parse(auth);
    if (authData.user.role === 'super_admin') {
      router.push('/admin');
      return;
    }

    setHospitalData(authData);
    fetchDashboardStats(authData.user.hospitalId);
  }, [router]);

  const fetchDashboardStats = async (hospitalId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/hospitals/${hospitalId}`);
      const data = await response.json();
      if (data.success && data.data.statistics) {
        setDashboardStats({
          totalBloodUnits: data.data.statistics.totalBloodUnits,
          activeDonors: data.data.statistics.totalDonors,
          collectionsToday: data.data.statistics.totalCollections,
          distributions: data.data.statistics.totalDistributions
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    message.success('Logged out successfully');
    router.push('/login');
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'inventory', icon: <MedicineBoxOutlined />, label: 'Blood Inventory' },
    { key: 'donors', icon: <UserOutlined />, label: 'Donor Management' },
    { key: 'collection', icon: <HeartOutlined />, label: 'Blood Collection' },
    { key: 'distribution', icon: <BarChartOutlined />, label: 'Distribution' },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'inventory':
        return <BloodInventory hospitalId={hospitalData.user.hospitalId} />;
      case 'donors':
        return <DonorManagement hospitalId={hospitalData.user.hospitalId} />;
      case 'collection':
        return <CollectionProcessing />;
      case 'distribution':
        return <IssueDistribution hospitalId={hospitalData.user.hospitalId} />;
      default:
        return (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={6}>
                <Card loading={loading}>
                  <Statistic
                    title="Total Blood Units"
                    value={dashboardStats.totalBloodUnits}
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={loading}>
                  <Statistic
                    title="Active Donors"
                    value={dashboardStats.activeDonors}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={loading}>
                  <Statistic
                    title="Total Collections"
                    value={dashboardStats.collectionsToday}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card loading={loading}>
                  <Statistic
                    title="Total Distributions"
                    value={dashboardStats.distributions}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        );
    }
  };

  if (!hospitalData) return null;
console.log(hospitalData);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div className="p-4 text-white text-center font-bold">
          {collapsed ? 'LF' : 'LifeFlow'}
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
              {hospitalData.hospital.name} - Blood Bank Management
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserOutlined className="text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">
                  {hospitalData.user.firstName && hospitalData.user.lastName 
                    ? `${hospitalData.user.firstName} ${hospitalData.user.lastName}`
                    : hospitalData.user.email
                  }
                </div>
                <div className="text-xs text-gray-500">
                  {hospitalData.user.role} • {hospitalData.hospital.name}
                </div>
              </div>
            </div>
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
    </Layout>
  );
}
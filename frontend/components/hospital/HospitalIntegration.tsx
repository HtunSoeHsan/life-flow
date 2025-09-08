'use client';

import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Space,
  Statistic,
  Alert,
  Tabs,
  Badge,
  Switch,
  Rate,
  Progress,
  Timeline,
  Divider,
  message,
  Avatar,
  List
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  BankOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ApiOutlined,
  SafetyOutlined,
  SettingOutlined,
  SyncOutlined,
  FileTextOutlined,
  TruckOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Hospital {
  key: number;
  hospitalId: string;
  name: string;
  type: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  integrationStatus: 'Connected' | 'Disconnected' | 'Pending' | 'Error';
  apiStatus: 'Online' | 'Offline' | 'Maintenance';
  lastSync: string;
  totalRequests: number;
  monthlyRequests: number;
  averageResponseTime: string;
  satisfactionRating: number;
  contractStart: string;
  contractEnd: string;
  emergencyContact: string;
  licenseNumber: string;
  accreditation: string;
  specialties: string[];
  bedCapacity: number;
  bloodBankCapacity: number;
}

interface Activity {
  hospital: string;
  action: string;
  time: string;
  type: 'request' | 'sync' | 'update';
}

export default function HospitalIntegration() {
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      key: 1,
      hospitalId: 'H001',
      name: 'City General Hospital',
      type: 'General Hospital',
      address: '123 Medical Center Dr, City, State 12345',
      contactPerson: 'Dr. Sarah Wilson',
      phone: '+1234567890',
      email: 'admin@citygeneral.com',
      website: 'www.citygeneral.com',
      status: 'Active',
      integrationStatus: 'Connected',
      apiStatus: 'Online',
      lastSync: '2024-01-15 14:30',
      totalRequests: 145,
      monthlyRequests: 23,
      averageResponseTime: '15 minutes',
      satisfactionRating: 4.8,
      contractStart: '2023-01-01',
      contractEnd: '2025-12-31',
      emergencyContact: '+1234567899',
      licenseNumber: 'LIC123456',
      accreditation: 'JCI Accredited',
      specialties: ['Emergency Medicine', 'Surgery', 'Cardiology'],
      bedCapacity: 500,
      bloodBankCapacity: 200
    },
    {
      key: 2,
      hospitalId: 'H002',
      name: 'Regional Medical Center',
      type: 'Medical Center',
      address: '456 Healthcare Ave, City, State 12345',
      contactPerson: 'Dr. Michael Johnson',
      phone: '+1234567891',
      email: 'contact@regionalmed.com',
      website: 'www.regionalmed.com',
      status: 'Active',
      integrationStatus: 'Connected',
      apiStatus: 'Online',
      lastSync: '2024-01-15 13:45',
      totalRequests: 98,
      monthlyRequests: 18,
      averageResponseTime: '12 minutes',
      satisfactionRating: 4.6,
      contractStart: '2023-06-01',
      contractEnd: '2026-05-31',
      emergencyContact: '+1234567898',
      licenseNumber: 'LIC123457',
      accreditation: 'NABH Accredited',
      specialties: ['Oncology', 'Neurology', 'Pediatrics'],
      bedCapacity: 350,
      bloodBankCapacity: 150
    },
    {
      key: 3,
      hospitalId: 'H003',
      name: 'Children\'s Hospital',
      type: 'Specialty Hospital',
      address: '789 Pediatric Way, City, State 12345',
      contactPerson: 'Dr. Emily Brown',
      phone: '+1234567892',
      email: 'info@childrenshospital.com',
      website: 'www.childrenshospital.com',
      status: 'Active',
      integrationStatus: 'Pending',
      apiStatus: 'Offline',
      lastSync: '2024-01-14 16:20',
      totalRequests: 67,
      monthlyRequests: 12,
      averageResponseTime: '20 minutes',
      satisfactionRating: 4.9,
      contractStart: '2023-03-01',
      contractEnd: '2025-02-28',
      emergencyContact: '+1234567897',
      licenseNumber: 'LIC123458',
      accreditation: 'JCI Accredited',
      specialties: ['Pediatrics', 'Neonatology', 'Pediatric Surgery'],
      bedCapacity: 200,
      bloodBankCapacity: 80
    }
  ]);

  const [showAddHospital, setShowAddHospital] = useState(false);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [activeTab, setActiveTab] = useState('hospitals');

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Active': 'green',
      'Inactive': 'red',
      'Suspended': 'orange',
      'Pending': 'blue'
    };
    return colors[status] || 'default';
  };

  const getIntegrationStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Connected': 'green',
      'Disconnected': 'red',
      'Pending': 'orange',
      'Error': 'red'
    };
    return colors[status] || 'default';
  };

  const getApiStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Online': 'green',
      'Offline': 'red',
      'Maintenance': 'orange'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Hospital Info',
      key: 'hospitalInfo',
      width: 250,
      render: (record: Hospital) => (
        <div>
          <div className="font-medium flex items-center space-x-2">
            <BankOutlined className="text-blue-500" />
            <span>{record.name}</span>
          </div>
          <div className="text-sm text-gray-500">{record.hospitalId}</div>
          <div className="text-sm text-gray-500">{record.type}</div>
          <div className="flex items-center space-x-2 mt-1">
            <Tag color={getStatusColor(record.status)} >{record.status}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Information',
      key: 'contact',
      width: 200,
      render: (record: Hospital) => (
        <div>
          <div className="text-sm font-medium">{record.contactPerson}</div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <PhoneOutlined />
            <span>{record.phone}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <MailOutlined />
            <span>{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Integration Status',
      key: 'integration',
      width: 150,
      render: (record: Hospital) => (
        <div className="text-center">
          <Tag color={getIntegrationStatusColor(record.integrationStatus)}>
            {record.integrationStatus}
          </Tag>
          <div className="mt-1">
            <Tag color={getApiStatusColor(record.apiStatus)} >
              API: {record.apiStatus}
            </Tag>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last sync: {dayjs(record.lastSync).format('DD MMM HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Activity',
      key: 'activity',
      width: 120,
      render: (record: Hospital) => (
        <div>
          <div className="text-sm">
            <span className="font-medium">{record.monthlyRequests}</span>
            <span className="text-gray-500"> this month</span>
          </div>
          <div className="text-sm text-gray-500">
            Total: {record.totalRequests}
          </div>
          <div className="text-sm text-gray-500">
            Avg: {record.averageResponseTime}
          </div>
        </div>
      ),
    },
    {
      title: 'Rating',
      key: 'rating',
      width: 120,
      render: (record: Hospital) => (
        <div className="text-center">
          <Rate disabled defaultValue={record.satisfactionRating} allowHalf />
          <div className="text-sm text-gray-500">{record.satisfactionRating}/5</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: Hospital) => (
        <Space direction="vertical" size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedHospital(record);
              setShowHospitalDetails(true);
            }}
          >
            View Details
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedHospital(record);
              setShowApiConfig(true);
            }}
          >
            API Config
          </Button>
          <Button type="link" size="small">
            Sync Now
          </Button>
        </Space>
      ),
    },
  ];

  // Statistics
  const totalHospitals = hospitals.length;
  const activeHospitals = hospitals.filter(h => h.status === 'Active').length;
  const connectedHospitals = hospitals.filter(h => h.integrationStatus === 'Connected').length;
  const totalRequests = hospitals.reduce((sum, h) => sum + h.monthlyRequests, 0);

  const recentActivities: Activity[] = [
    {
      hospital: 'City General Hospital',
      action: 'Blood request submitted',
      time: '5 minutes ago',
      type: 'request'
    },
    {
      hospital: 'Regional Medical Center',
      action: 'API sync completed',
      time: '15 minutes ago',
      type: 'sync'
    },
    {
      hospital: 'Children\'s Hospital',
      action: 'Integration status updated',
      time: '1 hour ago',
      type: 'update'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Hospitals"
              value={totalHospitals}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Hospitals"
              value={activeHospitals}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Connected"
              value={connectedHospitals}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monthly Requests"
              value={totalRequests}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
        <TabPane tab="Hospital Management" key="hospitals">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search hospitals..."
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                />
                <Select placeholder="Status" style={{ width: 120 }}>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="pending">Pending</Option>
                </Select>
                <Select placeholder="Type" style={{ width: 150 }}>
                  <Option value="general">General Hospital</Option>
                  <Option value="specialty">Specialty Hospital</Option>
                  <Option value="medical-center">Medical Center</Option>
                </Select>
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowAddHospital(true)}
              >
                Add Hospital
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={hospitals}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} hospitals`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="API Integration" key="api">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="API Endpoints Status">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Blood Request API</div>
                      <div className="text-sm text-gray-500">/api/v1/blood-requests</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge status="success" />
                      <span className="text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Inventory Sync API</div>
                      <div className="text-sm text-gray-500">/api/v1/inventory-sync</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge status="success" />
                      <span className="text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Delivery Tracking API</div>
                      <div className="text-sm text-gray-500">/api/v1/delivery-tracking</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge status="warning" />
                      <span className="text-orange-600">Maintenance</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="API Performance">
                <Gauge
                  percent={0.95}
                  range={{ color: '#30BF78' }}
                  indicator={{
                    pointer: { style: { stroke: '#D0D0D0' } },
                    pin: { style: { stroke: '#D0D0D0' } },
                  }}
                  statistic={{
                    content: {
                      style: {
                        fontSize: '16px',
                        lineHeight: '16px',
                      },
                    },
                  }}
                  height={200}
                />
                <div className="text-center mt-2">
                  <div className="text-lg font-semibold">95% Uptime</div>
                  <div className="text-sm text-gray-500">Last 30 days</div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Activity Monitor" key="activity">
          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="Recent Activities">
                <List
                  dataSource={recentActivities}
                  renderItem={(item: Activity) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={
                              item.type === 'request' ? <FileTextOutlined /> :
                              item.type === 'sync' ? <SyncOutlined /> :
                              <SettingOutlined />
                            }
                            style={{ 
                              backgroundColor: 
                                item.type === 'request' ? '#1890ff' :
                                item.type === 'sync' ? '#52c41a' :
                                '#faad14'
                            }}
                          />
                        }
                        title={item.hospital}
                        description={item.action}
                      />
                      <div className="text-sm text-gray-500">{item.time}</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="System Health">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database Connection</span>
                    <Badge status="success" text="Healthy" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Gateway</span>
                    <Badge status="success" text="Operational" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Message Queue</span>
                    <Badge status="success" text="Running" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Background Jobs</span>
                    <Badge status="warning" text="Delayed" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Request Volume Trends">
                <Line
                  data={[
                    { date: '2024-01-10', requests: 45 },
                    { date: '2024-01-11', requests: 52 },
                    { date: '2024-01-12', requests: 38 },
                    { date: '2024-01-13', requests: 61 },
                    { date: '2024-01-14', requests: 48 },
                    { date: '2024-01-15', requests: 55 },
                  ]}
                  xField="date"
                  yField="requests"
                  smooth
                  color="#1890ff"
                  height={250}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Hospital Performance">
                <Column
                  data={hospitals.map(h => ({
                    hospital: h.name.split(' ')[0],
                    rating: h.satisfactionRating
                  }))}
                  xField="hospital"
                  yField="rating"
                  color="#52c41a"
                  height={250}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Add Hospital Modal */}
      <Modal
        title="Add New Hospital"
        open={showAddHospital}
        onCancel={() => setShowAddHospital(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Divider orientation="left">Basic Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hospital Name" required>
                <Input placeholder="Enter hospital name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Hospital Type" required>
                <Select placeholder="Select type">
                  <Option value="general">General Hospital</Option>
                  <Option value="specialty">Specialty Hospital</Option>
                  <Option value="medical-center">Medical Center</Option>
                  <Option value="clinic">Clinic</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" required>
            <TextArea rows={2} placeholder="Enter complete address" />
          </Form.Item>

          <Divider orientation="left">Contact Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Contact Person" required>
                <Input placeholder="Primary contact person" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone Number" required>
                <Input placeholder="Contact phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email Address" required>
                <Input type="email" placeholder="Contact email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Website">
                <Input placeholder="Hospital website" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Hospital Details</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Bed Capacity">
                <Input type="number" placeholder="Number of beds" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Blood Bank Capacity">
                <Input type="number" placeholder="Blood storage capacity" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="License Number" required>
                <Input placeholder="Hospital license number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Specialties">
            <Select mode="multiple" placeholder="Select specialties">
              <Option value="emergency">Emergency Medicine</Option>
              <Option value="surgery">Surgery</Option>
              <Option value="cardiology">Cardiology</Option>
              <Option value="oncology">Oncology</Option>
              <Option value="pediatrics">Pediatrics</Option>
              <Option value="neurology">Neurology</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setShowAddHospital(false)}>Cancel</Button>
            <Button type="primary">Add Hospital</Button>
          </div>
        </Form>
      </Modal>

      {/* Hospital Details Modal */}
      <Modal
        title="Hospital Details"
        open={showHospitalDetails}
        onCancel={() => setShowHospitalDetails(false)}
        footer={null}
        width={900}
      >
        {selectedHospital && (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Basic Information" size="small">
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedHospital.name}</div>
                    <div><strong>Type:</strong> {selectedHospital.type}</div>
                    <div><strong>License:</strong> {selectedHospital.licenseNumber}</div>
                    <div><strong>Accreditation:</strong> {selectedHospital.accreditation}</div>
                    <div><strong>Bed Capacity:</strong> {selectedHospital.bedCapacity}</div>
                    <div><strong>Blood Bank Capacity:</strong> {selectedHospital.bloodBankCapacity}</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Contact Information" size="small">
                  <div className="space-y-2">
                    <div><strong>Contact Person:</strong> {selectedHospital.contactPerson}</div>
                    <div><strong>Phone:</strong> {selectedHospital.phone}</div>
                    <div><strong>Email:</strong> {selectedHospital.email}</div>
                    <div><strong>Website:</strong> {selectedHospital.website}</div>
                    <div><strong>Emergency Contact:</strong> {selectedHospital.emergencyContact}</div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="Performance Metrics" size="small">
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedHospital.totalRequests}</div>
                    <div className="text-sm text-gray-500">Total Requests</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedHospital.monthlyRequests}</div>
                    <div className="text-sm text-gray-500">This Month</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedHospital.averageResponseTime}</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedHospital.satisfactionRating}</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Specialties" size="small">
              <div className="flex flex-wrap gap-2">
                {selectedHospital.specialties.map((specialty, index) => (
                  <Tag key={index} color="blue">{specialty}</Tag>
                ))}
              </div>
            </Card>

            <Card title="Contract Information" size="small">
              <div className="space-y-2">
                <div><strong>Contract Start:</strong> {dayjs(selectedHospital.contractStart).format('DD MMM YYYY')}</div>
                <div><strong>Contract End:</strong> {dayjs(selectedHospital.contractEnd).format('DD MMM YYYY')}</div>
                <div><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedHospital.status)} className="ml-2">
                    {selectedHospital.status}
                  </Tag>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* API Configuration Modal */}
      <Modal
        title="API Configuration"
        open={showApiConfig}
        onCancel={() => setShowApiConfig(false)}
        footer={null}
        width={700}
      >
        {selectedHospital && (
          <div className="space-y-6">
            <Alert
              message="API Integration Settings"
              description={`Configure API settings for ${selectedHospital.name}`}
              type="info"
              showIcon
            />

            <Form layout="vertical">
              <Form.Item label="API Endpoint URL">
                <Input placeholder="https://hospital-api.example.com/v1" />
              </Form.Item>

              <Form.Item label="API Key">
                <Input.Password placeholder="Enter API key" />
              </Form.Item>

              <Form.Item label="Webhook URL">
                <Input placeholder="https://bloodbank.example.com/webhooks/hospital" />
              </Form.Item>

              <Form.Item label="Sync Frequency">
                <Select defaultValue="15min">
                  <Option value="5min">Every 5 minutes</Option>
                  <Option value="15min">Every 15 minutes</Option>
                  <Option value="30min">Every 30 minutes</Option>
                  <Option value="1hour">Every hour</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Enable Features">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Real-time Inventory Sync</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Automatic Request Processing</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Notifications</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emergency Alerts</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowApiConfig(false)}>Cancel</Button>
                <Button type="primary">Save Configuration</Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
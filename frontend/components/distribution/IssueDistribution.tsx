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
  DatePicker, 
  Modal, 
  Form, 
  InputNumber,
  Space,
  Statistic,
  Alert,
  Tabs,
  Badge,
  Timeline,
  Steps,
  Radio,
  Divider,
  message,
  Tooltip,
  Progress,
  Spin
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TruckOutlined,
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  BarcodeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ExportOutlined,
  PrinterOutlined,
  ScanOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import { useDistributions, useDistributionStats } from '@/hooks/useApi';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface BloodRequest {
  key: number;
  requestId: string;
  hospitalId: string;
  hospitalName: string;
  contactPerson: string;
  contactPhone: string;
  bloodGroup: string;
  component: string;
  unitsRequested: number;
  unitsIssued: number;
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  requestDate: string;
  requiredBy: string;
  status: 'Pending' | 'Approved' | 'Partially Fulfilled' | 'Completed' | 'Cancelled' | 'Delivered';
  purpose: string;
  patientInfo: string;
  issuedUnits: string[];
  deliveryMethod: string;
  notes: string;
}

export default function IssueDistribution() {
  const { distributions, loading, error, createDistribution, issueBloodUnits, cancelDistribution } = useDistributions();
  const { stats, loading: statsLoading } = useDistributionStats();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [issueForm] = Form.useForm();

  const handleNewRequest = async (values: any) => {
    try {
      setSubmitting(true);
      const requestData = {
        bloodUnitId: values.bloodUnitId || `UNIT${Date.now()}`,
        quantity: values.quantity,
        purpose: values.purpose,
        urgency: values.urgency,
        hospitalId: values.hospitalId,
        contactPerson: values.contactPerson,
        notes: values.notes
      };
      
      await createDistribution(requestData);
      message.success('Distribution request created successfully');
      setShowNewRequest(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create distribution request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueBlood = async (values: any) => {
    try {
      setSubmitting(true);
      if (selectedRequest) {
        await issueBloodUnits(selectedRequest.requestId, {
          bloodUnitIds: values.bloodUnitIds,
          issuedBy: values.issuedBy,
          deliveryMethod: values.deliveryMethod,
          notes: values.notes
        });
        message.success('Blood units issued successfully');
        setShowIssueModal(false);
        issueForm.resetFields();
        setSelectedRequest(null);
      }
    } catch (error) {
      message.error('Failed to issue blood units');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  // Mock data for demo if no real data
  const mockRequests = distributions.length === 0 ? [
    {
      key: 1,
      requestId: 'REQ2024001',
      hospitalId: 'H001',
      hospitalName: 'City General Hospital',
      contactPerson: 'Dr. Wilson',
      contactPhone: '+1234567890',
      bloodGroup: 'O-',
      component: 'Whole Blood',
      unitsRequested: 3,
      unitsIssued: 2,
      urgency: 'Emergency' as const,
      requestDate: '2024-01-15',
      requiredBy: '2024-01-15',
      status: 'Partially Fulfilled' as const,
      purpose: 'Emergency Surgery',
      patientInfo: 'Patient ID: P12345, Age: 45, Male',
      issuedUnits: ['BU2024001', 'BU2024002'],
      deliveryMethod: 'Hospital Pickup',
      notes: 'Critical patient, requires immediate attention'
    },
    {
      key: 2,
      requestId: 'REQ2024002',
      hospitalId: 'H002',
      hospitalName: 'Regional Medical Center',
      contactPerson: 'Dr. Johnson',
      contactPhone: '+1234567891',
      bloodGroup: 'A+',
      component: 'Platelets',
      unitsRequested: 2,
      unitsIssued: 2,
      urgency: 'Routine' as const,
      requestDate: '2024-01-14',
      requiredBy: '2024-01-16',
      status: 'Completed' as const,
      purpose: 'Scheduled Surgery',
      patientInfo: 'Patient ID: P12346, Age: 32, Female',
      issuedUnits: ['BU2024003', 'BU2024004'],
      deliveryMethod: 'Courier Service',
      notes: 'Standard procedure'
    }
  ] : distributions.map((d: any, index: number) => ({
    key: index + 1,
    requestId: d.distributionId || `REQ${index + 1}`,
    hospitalId: d.hospitalId || 'H001',
    hospitalName: d.hospitalName || 'Unknown Hospital',
    contactPerson: d.contactPerson || 'Unknown',
    contactPhone: d.contactPhone || 'N/A',
    bloodGroup: d.bloodGroup || 'Unknown',
    component: d.component || 'Whole Blood',
    unitsRequested: d.quantity || 1,
    unitsIssued: d.status === 'Issued' ? d.quantity || 1 : 0,
    urgency: d.urgency || 'Routine',
    requestDate: d.requestDate || new Date().toISOString(),
    requiredBy: d.requiredBy || new Date().toISOString(),
    status: d.status === 'Requested' ? 'Pending' : d.status === 'Issued' ? 'Completed' : d.status || 'Pending',
    purpose: d.purpose || 'Medical Treatment',
    patientInfo: d.patientInfo || 'N/A',
    issuedUnits: d.issuedUnits || [],
    deliveryMethod: d.deliveryMethod || 'Hospital Pickup',
    notes: d.notes || ''
  }));

  const displayRequests = mockRequests;
  const displayStats = statsLoading ? { total: 0, pending: 0, emergency: 0, completed: 0 } : stats;
  
  // Statistics
  const totalRequests = displayStats.total || displayRequests.length;
  const pendingRequests = displayStats.pending || displayRequests.filter((r: any) => r.status === 'Pending').length;
  const emergencyRequests = displayStats.emergency || displayRequests.filter((r: any) => r.urgency === 'Emergency').length;
  const completedRequests = displayStats.completed || displayRequests.filter((r: any) => r.status === 'Completed').length;

  const getUrgencyColor = (urgency: string): string => {
    const colors: Record<string, string> = {
      'Emergency': 'red',
      'Urgent': 'orange',
      'Routine': 'green'
    };
    return colors[urgency] || 'default';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Pending': 'orange',
      'Approved': 'blue',
      'Partially Fulfilled': 'purple',
      'Completed': 'green',
      'Cancelled': 'red',
      'Delivered': 'cyan'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Request Info',
      key: 'requestInfo',
      width: 200,
      render: (record: BloodRequest) => (
        <div>
          <div className="font-medium flex items-center space-x-2">
            <FileTextOutlined className="text-blue-500" />
            <span>{record.requestId}</span>
          </div>
          <div className="text-sm text-gray-500">{dayjs(record.requestDate).format('DD MMM YY')}</div>
          <div className="flex items-center space-x-2 mt-1">
            <Tag color="red" >{record.bloodGroup}</Tag>
            <Tag color="blue" >{record.component}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Hospital',
      key: 'hospital',
      width: 200,
      render: (record: BloodRequest) => (
        <div>
          <div className="font-medium">{record.hospitalName}</div>
          <div className="text-sm text-gray-500">{record.contactPerson}</div>
          <div className="text-sm text-gray-500">{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: 'Requirements',
      key: 'requirements',
      width: 120,
      render: (record: BloodRequest) => (
        <div>
          <div className="text-sm">
            <span className="font-medium">{record.unitsIssued}</span>
            <span className="text-gray-500">/{record.unitsRequested} units</span>
          </div>
          <Progress 
            percent={(record.unitsIssued / record.unitsRequested) * 100}
            size="small"
            showInfo={false}
          />
          <div className="text-xs text-gray-500 mt-1">
            Required: {dayjs(record.requiredBy).format('DD MMM')}
          </div>
        </div>
      ),
    },
    {
      title: 'Priority',
      key: 'priority',
      width: 100,
      render: (record: BloodRequest) => (
        <div className="text-center">
          <Tag color={getUrgencyColor(record.urgency)}>
            {record.urgency}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            {record.purpose}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record: BloodRequest) => (
        <div className="text-center">
          <Tag color={getStatusColor(record.status)}>
            {record.status}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            {record.deliveryMethod}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: BloodRequest) => (
        <Space direction="vertical" size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedRequest(record);
              setShowRequestDetails(true);
            }}
          >
            View Details
          </Button>
          {record.status === 'Pending' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                setSelectedRequest(record);
                setShowIssueModal(true);
              }}
            >
              Issue Blood
            </Button>
          )}
          <Button type="link" size="small">
            Print Receipt
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={totalRequests}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={pendingRequests}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Emergency Requests"
              value={emergencyRequests}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedRequests}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Emergency Alert */}
      {emergencyRequests > 0 && (
        <Alert
          message="Emergency Requests Pending"
          description={`${emergencyRequests} emergency blood requests require immediate attention.`}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" danger>
              View Emergency Requests
            </Button>
          }
          closable
        />
      )}

      <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
        <TabPane tab="Blood Requests" key="requests">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search requests..."
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                />
                <Select placeholder="Hospital" style={{ width: 200 }}>
                  <Option value="h001">City General Hospital</Option>
                  <Option value="h002">Regional Medical Center</Option>
                  <Option value="h003">Children's Hospital</Option>
                </Select>
                <Select placeholder="Status" style={{ width: 120 }}>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="completed">Completed</Option>
                </Select>
                <Select placeholder="Urgency" style={{ width: 120 }}>
                  <Option value="emergency">Emergency</Option>
                  <Option value="urgent">Urgent</Option>
                  <Option value="routine">Routine</Option>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button icon={<ExportOutlined />}>Export</Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewRequest(true)}
                  loading={submitting}
                >
                  New Request
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={displayRequests}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Distribution Tracking" key="tracking">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Active Deliveries">
                <Timeline>
                  <Timeline.Item 
                    dot={<TruckOutlined className="text-blue-500" />}
                    color="blue"
                  >
                    <div>
                      <div className="font-medium">REQ2024001 - City General Hospital</div>
                      <div className="text-sm text-gray-500">2 units O- blood • Emergency delivery</div>
                      <div className="text-xs text-gray-400">Dispatched 30 minutes ago</div>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item 
                    dot={<CheckCircleOutlined className="text-green-500" />}
                    color="green"
                  >
                    <div>
                      <div className="font-medium">REQ2024002 - Regional Medical Center</div>
                      <div className="text-sm text-gray-500">2 units A+ platelets • Delivered successfully</div>
                      <div className="text-xs text-gray-400">Completed 2 hours ago</div>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Daily Distribution Volume">
                <Line
                  data={[
                    { date: '2024-01-10', units: 25 },
                    { date: '2024-01-11', units: 32 },
                    { date: '2024-01-12', units: 18 },
                    { date: '2024-01-13', units: 41 },
                    { date: '2024-01-14', units: 28 },
                    { date: '2024-01-15', units: 35 },
                  ]}
                  xField="date"
                  yField="units"
                  smooth
                  color="#52c41a"
                  height={250}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Request Urgency Distribution">
                <Pie
                  data={[
                    { urgency: 'Emergency', count: 15, percentage: 25 },
                    { urgency: 'Urgent', count: 25, percentage: 42 },
                    { urgency: 'Routine', count: 20, percentage: 33 },
                  ]}
                  angleField="count"
                  colorField="urgency"
                  radius={0.8}
                  height={250}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Hospital Request Patterns">
                <Column
                  data={[
                    { hospital: 'City General', requests: 45 },
                    { hospital: 'Regional Medical', requests: 32 },
                    { hospital: 'Children\'s Hospital', requests: 28 },
                    { hospital: 'Emergency Center', requests: 38 },
                    { hospital: 'Trauma Unit', requests: 22 },
                  ]}
                  xField="hospital"
                  yField="requests"
                  color="#1890ff"
                  height={250}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* New Request Modal */}
      <Modal
        title="New Blood Request"
        open={showNewRequest}
        onCancel={() => setShowNewRequest(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleNewRequest}>
          <Divider orientation="left">Hospital Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Hospital" name="hospitalId" required>
                <Select placeholder="Select hospital">
                  <Option value="h001">City General Hospital</Option>
                  <Option value="h002">Regional Medical Center</Option>
                  <Option value="h003">Children's Hospital</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Contact Person" name="contactPerson" required>
                <Input placeholder="Doctor/Nurse name" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Blood Requirements</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Blood Group" name="bloodGroup" required>
                <Select placeholder="Select blood group">
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Component" name="component" required>
                <Select placeholder="Select component">
                  <Option value="whole">Whole Blood</Option>
                  <Option value="rbc">Red Blood Cells</Option>
                  <Option value="plasma">Plasma</Option>
                  <Option value="platelets">Platelets</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Units Required" name="quantity" required>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Urgency" name="urgency" required>
                <Radio.Group>
                  <Radio value="Emergency">Emergency</Radio>
                  <Radio value="Urgent">Urgent</Radio>
                  <Radio value="Routine">Routine</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Required By" name="requiredBy" required>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Purpose" name="purpose" required>
            <Select placeholder="Select purpose">
              <Option value="surgery">Surgery</Option>
              <Option value="emergency">Emergency Treatment</Option>
              <Option value="transfusion">Blood Transfusion</Option>
              <Option value="research">Research</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Patient Information" name="patientInfo">
            <TextArea rows={2} placeholder="Patient ID, Age, Gender, Medical condition" />
          </Form.Item>

          <Form.Item label="Additional Notes" name="notes">
            <TextArea rows={3} placeholder="Any special requirements or notes" />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={() => setShowNewRequest(false)} disabled={submitting}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Submit Request</Button>
          </div>
        </Form>
      </Modal>

      {/* Issue Blood Modal */}
      <Modal
        title="Issue Blood Units"
        open={showIssueModal}
        onCancel={() => setShowIssueModal(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <Alert
              message={`Processing request for ${selectedRequest.hospitalName}`}
              description={`${selectedRequest.unitsRequested} units of ${selectedRequest.bloodGroup} ${selectedRequest.component} required`}
              type="info"
              showIcon
            />
            
            <Form layout="vertical" form={issueForm} onFinish={handleIssueBlood}>
              <Form.Item label="Available Blood Units" name="bloodUnitIds">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">BU2024005</span>
                      <span className="ml-2 text-gray-500">450ml • Expires: 2024-02-20</span>
                    </div>
                    <Button type="primary" size="small">Select</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">BU2024006</span>
                      <span className="ml-2 text-gray-500">450ml • Expires: 2024-02-18</span>
                    </div>
                    <Button type="primary" size="small">Select</Button>
                  </div>
                </div>
              </Form.Item>

              <Form.Item label="Delivery Method" name="deliveryMethod">
                <Radio.Group defaultValue="pickup">
                  <Radio value="pickup">Hospital Pickup</Radio>
                  <Radio value="courier">Courier Service</Radio>
                  <Radio value="emergency">Emergency Transport</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Notes" name="notes">
                <TextArea rows={3} placeholder="Any special handling instructions" />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowIssueModal(false)} disabled={submitting}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>Issue Blood Units</Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Request Details Modal */}
      <Modal
        title="Request Details"
        open={showRequestDetails}
        onCancel={() => setShowRequestDetails(false)}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Request Information" size="small">
                  <div className="space-y-2">
                    <div><strong>Request ID:</strong> {selectedRequest.requestId}</div>
                    <div><strong>Date:</strong> {dayjs(selectedRequest.requestDate).format('DD MMM YYYY')}</div>
                    <div><strong>Required By:</strong> {dayjs(selectedRequest.requiredBy).format('DD MMM YYYY HH:mm')}</div>
                    <div><strong>Purpose:</strong> {selectedRequest.purpose}</div>
                    <div><strong>Urgency:</strong> 
                      <Tag color={getUrgencyColor(selectedRequest.urgency)} className="ml-2">
                        {selectedRequest.urgency}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Hospital Information" size="small">
                  <div className="space-y-2">
                    <div><strong>Hospital:</strong> {selectedRequest.hospitalName}</div>
                    <div><strong>Contact:</strong> {selectedRequest.contactPerson}</div>
                    <div><strong>Phone:</strong> {selectedRequest.contactPhone}</div>
                    <div><strong>Delivery:</strong> {selectedRequest.deliveryMethod}</div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="Blood Requirements" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedRequest.bloodGroup}</div>
                    <div className="text-sm text-gray-500">Blood Group</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{selectedRequest.component}</div>
                    <div className="text-sm text-gray-500">Component</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {selectedRequest.unitsIssued}/{selectedRequest.unitsRequested}
                    </div>
                    <div className="text-sm text-gray-500">Units (Issued/Requested)</div>
                  </div>
                </Col>
              </Row>
            </Card>

            {selectedRequest.patientInfo && (
              <Card title="Patient Information" size="small">
                <p>{selectedRequest.patientInfo}</p>
              </Card>
            )}

            {selectedRequest.issuedUnits.length > 0 && (
              <Card title="Issued Units" size="small">
                <div className="space-y-2">
                  {selectedRequest.issuedUnits.map((unitId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{unitId}</span>
                      <Tag color="green">Issued</Tag>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {selectedRequest.notes && (
              <Card title="Notes" size="small">
                <p>{selectedRequest.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
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
  Spin,
  Checkbox
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
  requestingHospitalId: string;
  targetHospitalId: string;
  hospitalName: string;
  contactPerson: string;
  contactPhone: string;
  component: string;
  bloodGroup?: string;
  unitsRequested: number;
  unitsIssued: number;
  urgency: 'Emergency' | 'Urgent' | 'Routine';
  requestDate: string;
  requiredBy: string;
  status: 'Pending' | 'Approved' | 'Partially Fulfilled' | 'Completed' | 'Cancelled' | 'Delivered';
  purpose: string;
  deliveryMethod: string;
  notes: string;
}

interface IssueDistributionProps {
  hospitalId?: string;
}

export default function IssueDistribution({ hospitalId: propHospitalId }: IssueDistributionProps) {
  const [hospitalId, setHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  
  useEffect(() => {
    const getHospitalId = () => {
      if (propHospitalId) return propHospitalId;
      
      try {
        const auth = localStorage.getItem('auth');
        if (auth) {
          const authData = JSON.parse(auth);
          return authData.user?.hospitalId || 'default-hospital';
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
      
      return 'default-hospital';
    };
    
    setHospitalId(getHospitalId());
    
    // Fetch hospitals
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/hospitals');
        const data = await response.json();
        if (data.success) {
          setHospitals(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    
    fetchHospitals();
  }, [propHospitalId]);
  
  const { distributions, myRequests, loading, error, createDistribution, issueBloodUnits, cancelDistribution } = useDistributions({ hospitalId });
  const { stats, loading: statsLoading } = useDistributionStats(hospitalId);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  
  // Search and filter states
  const [searchText, setSearchText] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [myRequestsSearchText, setMyRequestsSearchText] = useState('');
  const [myRequestsStatusFilter, setMyRequestsStatusFilter] = useState('');
  console.log("avaliable unit:", availableUnits);
  const handleNewRequest = async (values: any) => {
    try {
      setSubmitting(true);
      const requestData = {
        bloodUnitId: values.bloodUnitId || `UNIT${Date.now()}`,
        quantity: values.quantity,
        component: values.component,
        bloodGroup: values.bloodGroup,
        purpose: values.purpose,
        urgency: values.urgency,
        requestingHospitalId: hospitalId,
        targetHospitalId: values.targetHospitalId,
        contactPerson: values.contactPerson,
        ...(values.notes && { notes: values.notes })
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

  const fetchAvailableUnits = async (request: BloodRequest) => {
    try {
      setLoadingUnits(true);
      setAvailableUnits([]);
      const params = new URLSearchParams();
      if (request?.component && request.component !== 'Blood Unit') {
        params.append('component', request.component);
      }
      if (request?.bloodGroup) {
        params.append('bloodGroup', request.bloodGroup);
      }
      
      const url = `http://localhost:3001/api/distributions/available-units?${params}`;
      console.log('Fetching available units:', url, 'Hospital ID:', hospitalId, 'Request:', request);
      console.log('Request targetHospitalId:', request?.targetHospitalId, 'Request requestingHospitalId:', request?.requestingHospitalId);
      
      const response = await fetch(url, {
        headers: {
          'x-hospital-id': hospitalId,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Available units response:', data);
      
      if (data.success) {
        setAvailableUnits(data.data);
      } else {
        console.error('API returned error:', data);
        message.error(data.error || 'Failed to load available blood units');
      }
    } catch (error) {
      console.error('Failed to fetch available units:', error);
      message.error('Failed to load available blood units');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleIssueBlood = async (values: any) => {
    try {
      setSubmitting(true);
      if (selectedRequest && selectedUnits.length > 0) {
        await issueBloodUnits(selectedRequest.requestId, {
          bloodUnitIds: selectedUnits,
          issuedBy: values.issuedBy || 'System',
          notes: values.notes
        });
        message.success('Blood units issued successfully');
        setShowIssueModal(false);
        issueForm.resetFields();
        setSelectedRequest(null);
        setSelectedUnits([]);
        setAvailableUnits([]);
      } else {
        message.error('Please select at least one blood unit to issue');
      }
    } catch (error) {
      message.error('Failed to issue blood units');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = (record: BloodRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('Please allow popups to print receipt');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Distribution Receipt - ${record.requestId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
            .status { padding: 5px 10px; border-radius: 3px; color: white; }
            .status.pending { background-color: #faad14; }
            .status.completed { background-color: #52c41a; }
            .status.cancelled { background-color: #ff4d4f; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Blood Distribution Receipt</h2>
            <p>LifeFlow Blood Bank Management System</p>
          </div>
          
          <div class="section">
            <div><span class="label">Request ID:</span> ${record.requestId}</div>
            <div><span class="label">Date:</span> ${dayjs(record.requestDate).format('DD MMM YYYY HH:mm')}</div>
            <div><span class="label">Status:</span> <span class="status ${record.status.toLowerCase()}">${record.status}</span></div>
          </div>
          
          <div class="section">
            <h3>Hospital Information</h3>
            <div><span class="label">Hospital:</span> ${record.hospitalName}</div>
            <div><span class="label">Contact Person:</span> ${record.contactPerson}</div>
            <div><span class="label">Phone:</span> ${record.contactPhone}</div>
          </div>
          
          <div class="section">
            <h3>Request Details</h3>
            <div><span class="label">Component:</span> ${record.component}</div>
            <div><span class="label">Quantity:</span> ${record.unitsRequested} units</div>
            <div><span class="label">Issued:</span> ${record.unitsIssued} units</div>
            <div><span class="label">Purpose:</span> ${record.purpose}</div>
            <div><span class="label">Urgency:</span> ${record.urgency}</div>
            <div><span class="label">Delivery:</span> ${record.deliveryMethod}</div>
          </div>
          
          ${record.notes ? `
          <div class="section">
            <h3>Notes</h3>
            <p>${record.notes}</p>
          </div>
          ` : ''}
          
          <div class="section" style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${dayjs().format('DD MMM YYYY HH:mm')}</p>
            <p>This is a computer-generated receipt</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
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
console.log("distributions", distributions);
  // Transform API data to component format
  const incomingRequests = distributions.map((d: any, index: number) => {
    const requestingHospital = hospitals.find(h => h.id === d.requestingHospitalId);
    return {
      key: index + 1,
      requestId: d.distributionId,
      requestingHospitalId: d.requestingHospitalId,
      targetHospitalId: d.targetHospitalId,
      hospitalName: requestingHospital?.name || 'Unknown Hospital',
      contactPerson: d.contactPerson,
      contactPhone: requestingHospital?.phone || 'N/A',
      component: d.component || 'Blood Unit',
      bloodGroup: d.bloodGroup,
      unitsRequested: d.quantity,
      unitsIssued: d.unitsIssued || 0,
      urgency: d.urgency,
      requestDate: d.requestDate,
      requiredBy: d.requestDate,
      status: d.status === 'Requested' ? 'Pending' : d.status === 'Issued' ? 'Completed' : d.status,
      purpose: d.purpose,
      deliveryMethod: 'Hospital Pickup',
      notes: d.notes || ''
    };
  });

  // Filter incoming requests
  const filteredIncomingRequests = incomingRequests.filter((req: any) => {
    const matchesSearch = searchText === '' || 
      req.requestId?.toLowerCase().includes(searchText.toLowerCase()) ||
      req.hospitalName?.toLowerCase().includes(searchText.toLowerCase()) ||
      req.contactPerson?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesHospital = hospitalFilter === '' || req.requestingHospitalId === hospitalFilter;
    const matchesStatus = statusFilter === '' || req.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesUrgency = urgencyFilter === '' || req.urgency?.toLowerCase() === urgencyFilter.toLowerCase();
    
    return matchesSearch && matchesHospital && matchesStatus && matchesUrgency;
  });
  
  // Filter my requests
  const filteredMyRequests = myRequests.map((d: any, index: number) => {
    const targetHospital = hospitals.find(h => h.id === d.targetHospitalId);
    return {
      key: index + 1,
      requestId: d.distributionId,
      requestingHospitalId: d.requestingHospitalId,
      targetHospitalId: d.targetHospitalId,
      hospitalName: targetHospital?.name || 'Unknown Hospital',
      contactPerson: d.contactPerson || 'Unknown',
      contactPhone: 'N/A',
      component: d.component || 'Blood Unit',
      bloodGroup: d.bloodGroup,
      unitsRequested: d.quantity || 1,
      unitsIssued: d.unitsIssued || 0,
      urgency: d.urgency,
      requestDate: d.requestDate,
      requiredBy: d.requestDate,
      status: d.status === 'Requested' ? 'Pending' : d.status === 'Issued' ? 'Completed' : d.status,
      purpose: d.purpose,
      deliveryMethod: 'Hospital Pickup',
      notes: d.notes || ''
    };
  }).filter((req: any) => {
    const matchesSearch = myRequestsSearchText === '' || 
      req.requestId?.toLowerCase().includes(myRequestsSearchText.toLowerCase()) ||
      req.hospitalName?.toLowerCase().includes(myRequestsSearchText.toLowerCase());
    
    const matchesStatus = myRequestsStatusFilter === '' || req.status?.toLowerCase() === myRequestsStatusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  const displayStats = statsLoading ? { total: 0, pending: 0, emergency: 0, completed: 0 } : stats;
  
  // Statistics
  const totalRequests = displayStats.total || incomingRequests.length;
  const pendingRequests = displayStats.pending || incomingRequests.filter((r: any) => r.status === 'Pending').length;
  const emergencyRequests = displayStats.emergency || incomingRequests.filter((r: any) => r.urgency === 'Emergency' && r.status !== 'Completed' && r.status !== 'Cancelled').length;
  const completedRequests = displayStats.completed || incomingRequests.filter((r: any) => r.status === 'Completed').length;

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
            <Tag color="blue">{record.component}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Hospital Info',
      key: 'hospital',
      width: 200,
      render: (record: BloodRequest) => (
        <div>
          <div className="font-medium">
            {activeTab === 'requests' ? 'From: ' : 'To: '}
            {record.hospitalName}
          </div>
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
          {record.status === 'Pending' && activeTab === 'requests' && (
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                setSelectedRequest(record);
                setShowIssueModal(true);
                fetchAvailableUnits(record);
              }}
            >
              Issue Blood
            </Button>
          )}
          <Button 
            type="link" 
            size="small"
            onClick={() => handlePrintReceipt(record)}
          >
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
          closable
        />
      )}

      <Tabs activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
        <TabPane tab="Incoming Requests" key="requests">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search requests..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select 
                  placeholder="Hospital" 
                  value={hospitalFilter || undefined}
                  onChange={setHospitalFilter}
                  allowClear
                  style={{ width: 200 }}
                >
                  {hospitals.filter(h => h.id !== hospitalId).map(hospital => (
                    <Option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </Option>
                  ))}
                </Select>
                <Select 
                  placeholder="Status" 
                  value={statusFilter || undefined}
                  onChange={setStatusFilter}
                  allowClear
                  style={{ width: 120 }}
                >
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
                <Select 
                  placeholder="Urgency" 
                  value={urgencyFilter || undefined}
                  onChange={setUrgencyFilter}
                  allowClear
                  style={{ width: 120 }}
                >
                  <Option value="emergency">Emergency</Option>
                  <Option value="urgent">Urgent</Option>
                  <Option value="routine">Routine</Option>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  Showing {filteredIncomingRequests.length} of {incomingRequests.length} requests
                </span>
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
              dataSource={filteredIncomingRequests}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="My Requests" key="my-requests">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h4>Requests I Made to Other Hospitals</h4>
                <Input
                  placeholder="Search my requests..."
                  prefix={<SearchOutlined />}
                  value={myRequestsSearchText}
                  onChange={(e) => setMyRequestsSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select 
                  placeholder="Status" 
                  value={myRequestsStatusFilter || undefined}
                  onChange={setMyRequestsStatusFilter}
                  allowClear
                  style={{ width: 120 }}
                >
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </div>
              <span className="text-gray-500">
                Showing {filteredMyRequests.length} of {myRequests.length} requests
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={filteredMyRequests}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
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
          <Divider orientation="left">Request Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Request From Hospital" name="targetHospitalId" required>
                <Select placeholder="Select hospital to request from">
                  {hospitals.filter(h => h.id !== hospitalId).map(hospital => (
                    <Option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </Option>
                  ))}
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
              <Option value="Surgery">Surgery</Option>
              <Option value="Emergency Treatment">Emergency Treatment</Option>
              <Option value="Blood Transfusion">Blood Transfusion</Option>
              <Option value="Research">Research</Option>
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
        onCancel={() => {
          setShowIssueModal(false);
          setSelectedUnits([]);
          setAvailableUnits([]);
        }}
        footer={null}
        width={900}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <Alert
              message={`Processing request for ${selectedRequest.hospitalName}`}
              description={`${selectedRequest.unitsRequested} units of ${selectedRequest.component}${selectedRequest.bloodGroup ? ` (${selectedRequest.bloodGroup})` : ''} required - Select from filtered available inventory`}
              type="info"
              showIcon
            />
            
            <Card title="Available Blood Units" size="small">
              {loadingUnits ? (
                <div className="text-center py-4">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  size="small"
                  rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedUnits,
                    onChange: (selectedRowKeys: React.Key[]) => {
                      setSelectedUnits(selectedRowKeys as string[]);
                    },
                    getCheckboxProps: (record: any) => ({
                      disabled: selectedUnits.length >= selectedRequest.unitsRequested && !selectedUnits.includes(record.id)
                    })
                  }}
                  columns={[
                    {
                      title: 'Unit ID',
                      dataIndex: 'unitId',
                      key: 'unitId',
                      width: 120
                    },
                    {
                      title: 'Blood Group',
                      dataIndex: 'bloodGroup',
                      key: 'bloodGroup',
                      width: 100,
                      render: (bloodGroup: string) => (
                        <Tag color="red">{bloodGroup}</Tag>
                      )
                    },
                    {
                      title: 'Component',
                      dataIndex: 'component',
                      key: 'component',
                      width: 120
                    },
                    {
                      title: 'Volume (ml)',
                      dataIndex: 'volume',
                      key: 'volume',
                      width: 100
                    },
                    {
                      title: 'Expiry Date',
                      dataIndex: 'expiryDate',
                      key: 'expiryDate',
                      width: 120,
                      render: (date: string) => dayjs(date).format('DD MMM YY')
                    },
                    {
                      title: 'Donor',
                      key: 'donor',
                      width: 120,
                      render: (record: any) => (
                        record.donor ? `${record.donor.firstName} ${record.donor.lastName}` : 'N/A'
                      )
                    }
                  ]}
                  dataSource={availableUnits.map(unit => ({ ...unit, key: unit.id }))}
                  pagination={false}
                  scroll={{ y: 200 }}
                />
              )}
              <div className="mt-2 text-sm text-gray-500">
                Selected: {selectedUnits.length} / {selectedRequest.unitsRequested} units
              </div>
            </Card>
            
            <Form layout="vertical" form={issueForm} onFinish={handleIssueBlood}>
              <Form.Item label="Issued By" name="issuedBy" rules={[{ required: true, message: 'Please enter who is issuing the blood' }]}>
                <Input placeholder="Enter staff name or ID" />
              </Form.Item>

              <Form.Item label="Notes" name="notes">
                <TextArea rows={3} placeholder="Any special handling instructions or notes" />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => {
                  setShowIssueModal(false);
                  setSelectedUnits([]);
                  setAvailableUnits([]);
                }} disabled={submitting}>Cancel</Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  disabled={selectedUnits.length === 0}
                >
                  Issue {selectedUnits.length} Blood Units
                </Button>
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
                    <div className="text-lg font-semibold">{selectedRequest.component}</div>
                    <div className="text-sm text-gray-500">Component</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <Tag color="red" className="text-lg font-semibold px-3 py-1">
                      {selectedRequest.bloodGroup || 'Any'}
                    </Tag>
                    <div className="text-sm text-gray-500 mt-1">Blood Group</div>
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
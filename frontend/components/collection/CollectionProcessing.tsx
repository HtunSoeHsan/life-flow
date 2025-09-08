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
  Statistic,
  Progress,
  Tabs,
  Steps,
  Space,
  message,
  Spin,
  Alert
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ExperimentOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import { useCollections } from '@/hooks/useApi';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

type QualityChecks = {
  visualInspection: string;
  volumeCheck: string;
  temperatureCheck: string;
  labelingCheck: string;
};

type TestingStatus = {
  bloodTyping: string;
  infectiousDisease: string;
  crossMatching: string;
};

type Collection = {
  key: number;
  collectionId: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  collectionDate: string;
  collectionTime: string;
  volume: number;
  collectionType: string;
  collectionMethod: string;
  location: string;
  staff: string;
  status: string;
  currentStep: number;
  bagNumber: string;
  temperature: number;
  qualityChecks: QualityChecks;
  testingStatus: TestingStatus;
};

interface CollectionProcessingProps {
  hospitalId?: string;
}

export default function CollectionProcessing({ hospitalId: propHospitalId }: CollectionProcessingProps) {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hospitalId, setHospitalId] = useState<string>('');

  useEffect(() => {
    // Get hospital ID from props, localStorage, or default
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
  }, [propHospitalId]);
  
  const { collections, pagination, loading, error, createCollection, updateCollectionStatus } = useCollections({
    hospitalId,
    status: filterStatus,
    search: searchText,
    page: currentPage,
    limit: 10
  });
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [showProcessingDetails, setShowProcessingDetails] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('collections');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  const handleNewCollection = async (values: any) => {
    try {
      setSubmitting(true);
      const collectionData = {
        donorId: values.donorId,
        collectionDate: values.collectionDate.toISOString(),
        collectionType: values.collectionType,
        collectionMethod: values.collectionMethod,
        volume: 450,
        location: 'Main Center',
        staff: 'Current User'
      };
      
      await createCollection(collectionData);
      message.success('Collection scheduled successfully');
      setShowNewCollection(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to schedule collection');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hospitalId || (loading && !collections.length)) {
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

  const displayCollections = collections || [];

  const collectionSteps = [
    'Donor Registration',
    'Pre-donation Screening',
    'Blood Collection',
    'Quality Control',
    'Testing & Processing',
    'Storage'
  ];

  const columns = [
    {
      title: 'Collection Info',
      key: 'collectionInfo',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium flex items-center space-x-2">
            <BarcodeOutlined className="text-blue-500" />
            <span>{record.collectionId || record.id}</span>
          </div>
          <div className="text-sm text-gray-500">Bag: {record.bagNumber || 'N/A'}</div>
          <div className="flex items-center space-x-2 mt-1">
            <Tag color="red">{record.donor?.bloodGroup || record.bloodGroup || 'Unknown'}</Tag>
            <Tag color="blue">{record.collectionType || 'Unknown'}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Donor',
      key: 'donor',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">
            {record.donor ? `${record.donor.firstName} ${record.donor.lastName}` : record.donorName || 'Unknown'}
          </div>
          <div className="text-sm text-gray-500">{record.donor?.donorId || record.donorId || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Collection Details',
      key: 'details',
      width: 150,
      render: (_: any, record: any) => (
        <div>
          <div className="text-sm">{dayjs(record.collectionDate).format('DD MMM YY')}</div>
          <div className="text-sm text-gray-500">{record.collectionTime || dayjs(record.collectionDate).format('HH:mm')}</div>
          <div className="text-sm text-gray-500">{record.volume || 450}ml</div>
        </div>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 200,
      render: (_: any, record: any) => {
        const currentStep = record.currentStep || 1;
        const statusColor = record.status === 'Completed' ? 'green' : 
                           record.status === 'Processing' ? 'orange' : 'blue';
        return (
          <div>
            <div className="mb-2">
              <Tag color={statusColor}>{record.status || 'Scheduled'}</Tag>
            </div>
            <Progress
              percent={(currentStep / collectionSteps.length) * 100}
              size="small"
              showInfo={false}
            />
            <div className="text-xs text-gray-500 mt-1">
              Step {currentStep} of {collectionSteps.length}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Location & Staff',
      key: 'location',
      width: 120,
      render: (_: any, record: any) => (
        <div>
          <div className="text-sm font-medium">{record.location || 'Main Center'}</div>
          <div className="text-sm text-gray-500">{record.staff || 'Staff'}</div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedCollection(record);
              setShowProcessingDetails(true);
            }}
          >
            View Details
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedCollection(record);
              statusForm.setFieldsValue({ status: record.status, notes: '' });
              setShowUpdateStatus(true);
            }}
          >
            Update Status
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              const printContent = `
                <div style="font-family: Arial, sans-serif; margin: 20px;">
                  <div style="border: 2px solid #000; padding: 15px; max-width: 400px;">
                    <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
                      <h3>BLOOD COLLECTION UNIT</h3>
                      <p>For Transfusion Use Only</p>
                    </div>
                    
                    <div style="font-size: 18px; font-weight: bold; color: red; text-align: center; border: 2px solid red; padding: 5px; margin: 10px 0;">${record.donor?.bloodGroup || record.bloodGroup || 'UNKNOWN'}</div>
                    
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Unit ID:</strong> ${record.collectionId || record.id}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Bag No:</strong> ${record.bagNumber || 'N/A'}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Volume:</strong> ${record.volume || 450} mL</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Type:</strong> ${record.collectionType || 'Whole Blood'}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Date:</strong> ${dayjs(record.collectionDate).format('DD/MM/YYYY')}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Time:</strong> ${record.collectionTime || dayjs(record.collectionDate).format('HH:mm')}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Method:</strong> ${record.collectionMethod || 'Voluntary'}</div>
                    <div style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">Status:</strong> ${record.status || 'Scheduled'}</div>
                    
                    <div style="text-align: center; margin: 15px 0; font-family: monospace;">
                      <div style="font-size: 20px;">||||| |||| | |||| |||||</div>
                      <div>${record.collectionId || record.id}</div>
                    </div>
                    
                    <div style="font-size: 10px; text-align: center; margin-top: 15px; font-weight: bold;">
                      ⚠ HANDLE WITH CARE • BIOHAZARD • KEEP REFRIGERATED 2-6°C
                    </div>
                  </div>
                </div>
              `;
              
              const originalContent = document.body.innerHTML;
              document.body.innerHTML = printContent;
              window.print();
              document.body.innerHTML = originalContent;
            }}
          >
            Print Label
          </Button>
        </Space>
      )
    }
  ];

  const totalCollections = pagination?.total || displayCollections.length;
  const todayCollections = displayCollections.filter((c: any) =>
    dayjs(c.collectionDate).isSame(dayjs(), 'day')
  ).length;
  const processingCollections = displayCollections.filter((c: any) =>
    c.status === 'Processing' || c.status === 'In Progress'
  ).length;
  const completedCollections = displayCollections.filter((c: any) => c.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Collections"
              value={totalCollections}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Collections"
              value={todayCollections}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Processing"
              value={processingCollections}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedCollections}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Collection Management" key="collections">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search collections..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <RangePicker />
                <Select 
                  placeholder="Status" 
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="Scheduled">Scheduled</Option>
                  <Option value="Processing">Processing</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowNewCollection(true)}
              >
                New Collection
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={displayCollections.map((item: any, index: number) => ({
                ...item,
                key: item.id || item.collectionId || index
              }))}
              loading={loading}
              pagination={{
                current: pagination?.page || 1,
                pageSize: pagination?.limit || 10,
                total: pagination?.total || 0,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} collections`,
                onChange: (page) => setCurrentPage(page)
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Processing Workflow" key="workflow">
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Collection Processing Steps">
                <Steps current={2} size="small">
                  {collectionSteps.map((step, idx) => (
                    <Step key={idx} title={step} />
                  ))}
                </Steps>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Daily Collection Trends">
                <Line
                  data={[
                    { date: '2024-01-10', collections: 15 },
                    { date: '2024-01-11', collections: 18 },
                    { date: '2024-01-12', collections: 12 },
                    { date: '2024-01-13', collections: 22 },
                    { date: '2024-01-14', collections: 16 },
                    { date: '2024-01-15', collections: 20 }
                  ]}
                  xField="date"
                  yField="collections"
                  smooth
                  color="#1890ff"
                  height={250}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Collection Methods">
                <Column
                  data={[
                    { method: 'Voluntary', count: 45 },
                    { method: 'Replacement', count: 12 },
                    { method: 'Apheresis', count: 8 },
                    { method: 'Autologous', count: 3 }
                  ]}
                  xField="method"
                  yField="count"
                  color="#52c41a"
                  height={250}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* New Collection Modal */}
      <Modal
        title="New Blood Collection"
        open={showNewCollection}
        onCancel={() => setShowNewCollection(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleNewCollection}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="donorId" 
                label="Donor ID" 
                rules={[{ required: true, message: 'Please enter donor ID' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter donor ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="collectionDate" 
                label="Collection Date" 
                rules={[{ required: true, message: 'Please select collection date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="collectionType" 
                label="Collection Type" 
                rules={[{ required: true, message: 'Please select collection type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="Whole Blood">Whole Blood</Option>
                  <Option value="Plasma">Plasma</Option>
                  <Option value="Platelets">Platelets</Option>
                  <Option value="Red Blood Cells">Red Blood Cells</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="collectionMethod" 
                label="Collection Method" 
                rules={[{ required: true, message: 'Please select collection method' }]}
              >
                <Select placeholder="Select method">
                  <Option value="Voluntary">Voluntary</Option>
                  <Option value="Replacement">Replacement</Option>
                  <Option value="Apheresis">Apheresis</Option>
                  <Option value="Autologous">Autologous</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end mt-6 space-x-2">
            <Button onClick={() => setShowNewCollection(false)} disabled={submitting}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Schedule Collection</Button>
          </div>
        </Form>
      </Modal>

      {/* Processing Details Modal */}
      <Modal
        title="Collection Processing Details"
        open={showProcessingDetails}
        onCancel={() => setShowProcessingDetails(false)}
        footer={null}
        width={900}
      >
        {selectedCollection && (
          <div className="space-y-6">
            <Steps current={(selectedCollection.currentStep || 1) - 1} size="small">
              {collectionSteps.map((step, idx) => (
                <Step key={idx} title={step} />
              ))}
            </Steps>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Collection Information" size="small">
                  <div className="space-y-2">
                    <div><strong>Collection ID:</strong> {selectedCollection.collectionId || selectedCollection.id}</div>
                    <div><strong>Donor:</strong> {
                      selectedCollection.donor ? 
                        `${selectedCollection.donor.firstName} ${selectedCollection.donor.lastName}` : 
                        selectedCollection.donorName || 'Unknown'
                    }</div>
                    <div><strong>Blood Group:</strong> {
                      selectedCollection.donor?.bloodGroup || selectedCollection.bloodGroup || 'Unknown'
                    }</div>
                    <div><strong>Volume:</strong> {selectedCollection.volume || 450}ml</div>
                    <div><strong>Type:</strong> {selectedCollection.collectionType || 'Unknown'}</div>
                    <div><strong>Status:</strong> 
                      <Tag color={selectedCollection.status === 'Completed' ? 'green' : 'blue'} className="ml-2">
                        {selectedCollection.status || 'Scheduled'}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Quality Checks" size="small">
                  <div className="space-y-2">
                    {selectedCollection.qualityChecks && typeof selectedCollection.qualityChecks === 'object' ? 
                      Object.entries(selectedCollection.qualityChecks).map(([check, status]) => (
                        <div key={check} className="flex justify-between">
                          <span>{check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <Tag color={status === 'Passed' ? 'green' : 'orange'}>{status as string}</Tag>
                        </div>
                      )) : 
                      <div className="text-gray-500">Quality checks will be available during processing</div>
                    }
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Collection Status"
        open={showUpdateStatus}
        onCancel={() => setShowUpdateStatus(false)}
        footer={null}
        width={500}
      >
        <Form 
          form={statusForm} 
          layout="vertical" 
          onFinish={async (values) => {
            try {
              setSubmitting(true);
              await updateCollectionStatus(selectedCollection.id, values.status, values.notes);
              message.success('Status updated successfully');
              setShowUpdateStatus(false);
            } catch (error) {
              message.error('Failed to update status');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form.Item 
            name="status" 
            label="Status" 
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Processing">Processing</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowUpdateStatus(false)} disabled={submitting}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Update Status</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

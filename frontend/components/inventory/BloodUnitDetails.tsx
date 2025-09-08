'use client';

import { Modal, Card, Descriptions, Tag, Timeline, Progress, Row, Col, Button, Space, Divider } from 'antd';
import { 
  BarcodeOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  HeartOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Thermometer } from 'lucide-react';

interface BloodUnitDetailsProps {
  visible: boolean;
  onCancel: () => void;
  unit: any;
  onEdit?: (unit: any) => void;
  onUpdateTests?: (unit: any) => void;
  onChangeStatus?: (unit: any) => void;
  onIssue?: (unit: any) => void;
}

export default function BloodUnitDetails({ visible, onCancel, unit, onEdit, onUpdateTests, onChangeStatus, onIssue }: BloodUnitDetailsProps) {
  if (!unit) return null;

  const handleEditUnit = () => {
    onEdit?.(unit);
  };

  const handleUpdateTests = () => {
    onUpdateTests?.(unit);
  };

  const handleChangeStatus = () => {
    onChangeStatus?.(unit);
  };

  const handleIssueUnit = () => {
    onIssue?.(unit);
  };

  const getTestStatusIcon = (result: string) => {
    switch (result) {
      case 'Negative': return <CheckCircleOutlined className="text-green-500" />;
      case 'Positive': return <ExclamationCircleOutlined className="text-red-500" />;
      case 'Pending': return <ClockCircleOutlined className="text-orange-500" />;
      default: return <ClockCircleOutlined className="text-gray-500" />;
    }
  };

  const getTestStatusColor = (result: string) => {
    switch (result) {
      case 'Negative': return 'green';
      case 'Positive': return 'red';
      case 'Pending': return 'orange';
      default: return 'default';
    }
  };

  const getExpiryStatus = () => {
    const daysUntilExpiry = dayjs(unit.expiryDate).diff(dayjs(), 'day');
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'red', text: 'Expired', progress: 0 };
    
    const totalDays = dayjs(unit.expiryDate).diff(dayjs(unit.collectionDate), 'day');
    const remainingDays = daysUntilExpiry;
    const progress = ((totalDays - remainingDays) / totalDays) * 100;
    
    if (daysUntilExpiry <= 3) return { status: 'critical', color: 'red', text: `${daysUntilExpiry} days left`, progress };
    if (daysUntilExpiry <= 7) return { status: 'warning', color: 'orange', text: `${daysUntilExpiry} days left`, progress };
    return { status: 'normal', color: 'green', text: `${daysUntilExpiry} days left`, progress };
  };

  const expiryStatus = getExpiryStatus();

  const unitHistory = [
    {
      time: unit.collectionDate,
      title: 'Blood Collection',
      description: `Collected from donor ${unit.donor ? `${unit.donor.firstName} ${unit.donor.lastName}` : 'Unknown Donor'}`,
      icon: <HeartOutlined className="text-red-500" />
    },
    {
      time: unit.collectionDate,
      title: 'Initial Processing',
      description: 'Unit processed and labeled',
      icon: <MedicineBoxOutlined className="text-blue-500" />
    },
    {
      time: unit.collectionDate,
      title: 'Quality Control',
      description: 'Visual inspection completed',
      icon: <CheckCircleOutlined className="text-green-500" />
    },
    {
      time: unit.collectionDate,
      title: 'Storage',
      description: `Stored in ${unit.location}`,
      icon: <Thermometer className="text-blue-500" />
    }
  ];

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <BarcodeOutlined className="text-blue-500" />
          <div>
            <div className="font-semibold">Blood Unit Details</div>
            <div className="text-sm text-gray-500">{unit.unitId}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button onClick={() => handleEditUnit()}>Edit Unit</Button>
            <Button onClick={() => handleUpdateTests()}>Update Tests</Button>
          </div>
          <div className="space-x-2">
            <Button onClick={() => handleChangeStatus()}>Change Status</Button>
            <Button type="primary" onClick={() => handleIssueUnit()}>Issue Unit</Button>
          </div>
        </div>
      }
      width={900}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Status Overview */}
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" className="text-center">
              <div className="text-2xl font-bold mb-2" style={{ color: '#dc2626' }}>
                {unit.bloodGroup}
              </div>
              <div className="text-sm text-gray-500">Blood Group</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <div className="text-lg font-semibold mb-2">{unit.component}</div>
              <div className="text-sm text-gray-500">Component</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <div className="text-lg font-semibold mb-2">{unit.volume}ml</div>
              <div className="text-sm text-gray-500">Volume</div>
            </Card>
          </Col>
        </Row>

        {/* Expiry Status */}
        <Card title="Expiry Status" size="small">
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span>Time until expiry:</span>
              <Tag color={expiryStatus.color} icon={<ClockCircleOutlined />}>
                {expiryStatus.text}
              </Tag>
            </div>
            <Progress 
              percent={expiryStatus.progress} 
              strokeColor={expiryStatus.color === 'red' ? '#ff4d4f' : expiryStatus.color === 'orange' ? '#faad14' : '#52c41a'}
              showInfo={false}
            />
          </div>
          <div className="text-sm text-gray-600">
            Expires on: {dayjs(unit.expiryDate).format('DD MMM YYYY')}
          </div>
        </Card>

        {/* Unit Information */}
        <Card title="Unit Information" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Unit ID">{unit.unitId}</Descriptions.Item>
            <Descriptions.Item label="Batch Number">{unit.batchNumber}</Descriptions.Item>
            <Descriptions.Item label="Blood Group">
              <Tag color="red">{unit.bloodGroup}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Component">
              <Tag color="blue">{unit.component}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Volume">{unit.volume} ml</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={unit.status === 'Available' ? 'green' : unit.status === 'Reserved' ? 'blue' : 'orange'}>
                {unit.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Collection Date">
              {dayjs(unit.collectionDate).format('DD MMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Expiry Date">
              {dayjs(unit.expiryDate).format('DD MMM YYYY')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Donor Information */}
        <Card title="Donor Information" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Donor ID">{unit.donor?.donorId || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Donor Name">{unit.donor ? `${unit.donor.firstName} ${unit.donor.lastName}` : 'Unknown Donor'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Storage Information */}
        <Card title="Storage Information" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Location">{unit.location}</Descriptions.Item>
            <Descriptions.Item label="Temperature">
              <span className="flex items-center space-x-1">
                <Thermometer />
                <span>{unit.temperature}°C</span>
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Quarantine Status">
              <Tag color={unit.quarantineStatus === 'Released' ? 'green' : 'orange'}>
                {unit.quarantineStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cross Match Status">
              <Tag color={unit.crossMatchStatus === 'Compatible' ? 'green' : 
                          unit.crossMatchStatus === 'Incompatible' ? 'red' : 'orange'}>
                {unit.crossMatchStatus}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Test Results */}
        <Card title="Test Results" size="small">
          <Row gutter={16}>
            <Col span={6}>
              <div className="text-center p-3 border rounded">
                <div className="mb-2">{getTestStatusIcon(unit.testResults.hiv)}</div>
                <div className="font-medium">HIV</div>
                <Tag color={getTestStatusColor(unit.testResults.hiv)} >
                  {unit.testResults.hiv}
                </Tag>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 border rounded">
                <div className="mb-2">{getTestStatusIcon(unit.testResults.hbv)}</div>
                <div className="font-medium">HBV</div>
                <Tag color={getTestStatusColor(unit.testResults.hbv)} >
                  {unit.testResults.hbv}
                </Tag>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 border rounded">
                <div className="mb-2">{getTestStatusIcon(unit.testResults.hcv)}</div>
                <div className="font-medium">HCV</div>
                <Tag color={getTestStatusColor(unit.testResults.hcv)}>
                  {unit.testResults.hcv}
                </Tag>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center p-3 border rounded">
                <div className="mb-2">{getTestStatusIcon(unit.testResults.syphilis)}</div>
                <div className="font-medium">Syphilis</div>
                <Tag color={getTestStatusColor(unit.testResults.syphilis)} >
                  {unit.testResults.syphilis}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Unit History */}
        <Card title="Unit History" size="small">
          <Timeline
            items={unitHistory.map(item => ({
              dot: item.icon,
              children: (
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                  <div className="text-xs text-gray-400">
                    {dayjs(item.time).format('DD MMM YYYY HH:mm')}
                  </div>
                </div>
              ),
            }))}
          />
        </Card>

        {/* Notes */}
        {unit.notes && (
          <Card title="Notes" size="small">
            <p className="text-sm">{unit.notes}</p>
          </Card>
        )}


      </div>
    </Modal>
  );
}
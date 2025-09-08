'use client';

import { Modal, Table, Tag, Button, Space, Alert, Statistic, Row, Col, Card } from 'antd';
import { 
  WarningOutlined,
  ClockCircleOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

interface BloodUnit {
  unitId: string;
  bloodGroup: string;
  component: string;
  volume: number;
  expiryDate: string;
  location: string;
  [key: string]: any; // for any additional properties
}

interface ExpiryUrgency {
  level: 'critical' | 'high' | 'medium' | 'low';
  color: string;
  text: string;
}

interface ExpiryAlertsProps {
  visible: boolean;
  onCancel: () => void;
  units: BloodUnit[];
}

export default function ExpiryAlerts({ visible, onCancel, units }: ExpiryAlertsProps) {
  const getExpiryUrgency = (expiryDate: string): ExpiryUrgency => {
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), 'day');
    if (daysUntilExpiry <= 1) return { level: 'critical', color: 'red', text: 'Critical' };
    if (daysUntilExpiry <= 3) return { level: 'high', color: 'volcano', text: 'High' };
    if (daysUntilExpiry <= 7) return { level: 'medium', color: 'orange', text: 'Medium' };
    return { level: 'low', color: 'yellow', text: 'Low' };
  };

  const columns = [
    {
      title: 'Unit ID',
      dataIndex: 'unitId',
      key: 'unitId',
      render: (text: string) => (
        <div className="flex items-center space-x-2">
          <BarcodeOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      key: 'bloodGroup',
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (volume: number) => `${volume}ml`,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => (
        <div>
          <div className="font-medium">{dayjs(date).format('DD MMM YYYY')}</div>
          <div className="text-xs text-gray-500">
            {dayjs(date).diff(dayjs(), 'day')} days left
          </div>
        </div>
      ),
    },
    {
      title: 'Urgency',
      key: 'urgency',
      render: (record: BloodUnit) => {
        const urgency = getExpiryUrgency(record.expiryDate);
        return (
          <Tag 
            color={urgency.color} 
            icon={urgency.level === 'critical' ? <ExclamationCircleOutlined /> : <WarningOutlined />}
          >
            {urgency.text}
          </Tag>
        );
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: BloodUnit) => (
        <Space>
          <Button size="small" type="primary">
            Issue Now
          </Button>
          <Button size="small">
            Extend
          </Button>
          <Button size="small" danger>
            Discard
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const criticalUnits = units.filter(unit => {
    const days = dayjs(unit.expiryDate).diff(dayjs(), 'day');
    return days <= 1;
  }).length;

  const highPriorityUnits = units.filter(unit => {
    const days = dayjs(unit.expiryDate).diff(dayjs(), 'day');
    return days <= 3 && days > 1;
  }).length;

  const mediumPriorityUnits = units.filter(unit => {
    const days = dayjs(unit.expiryDate).diff(dayjs(), 'day');
    return days <= 7 && days > 3;
  }).length;

  const totalValue = units.reduce((sum, unit) => {
    // Estimated value per unit based on component
    const values: Record<string, number> = {
      'Whole Blood': 200,
      'Red Blood Cells': 150,
      'Plasma': 100,
      'Platelets': 300,
      'Cryoprecipitate': 250
    };
    return sum + (values[unit.component] || 200);
  }, 0);

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <WarningOutlined className="text-orange-500" />
          <span>Blood Unit Expiry Alerts</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Alert Summary */}
        <Alert
          message="Immediate Action Required"
          description={`${units.length} blood units are expiring soon and require immediate attention to prevent wastage.`}
          type="warning"
          showIcon
          closable={false}
        />

        {/* Statistics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Critical (≤1 day)"
                value={criticalUnits}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="High Priority (≤3 days)"
                value={highPriorityUnits}
                valueStyle={{ color: '#fa541c' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Medium Priority (≤7 days)"
                value={mediumPriorityUnits}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Estimated Value at Risk"
                value={totalValue}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Recommended Actions */}
        <Card title="Recommended Actions" size="small">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag color="red">Critical</Tag>
              <span>Issue immediately to hospitals or discard if no demand</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="volcano">High</Tag>
              <span>Contact hospitals for urgent requirements</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="orange">Medium</Tag>
              <span>Schedule for routine distribution or special campaigns</span>
            </div>
          </div>
        </Card>

        {/* Units Table */}
        <Table<BloodUnit>
          columns={columns}
          dataSource={units}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} units`,
          }}
          scroll={{ x: 1000 }}
          rowKey="unitId"
        />

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button type="primary" danger>
              Bulk Issue Critical Units
            </Button>
            <Button>
              Generate Discard Report
            </Button>
            <Button>
              Notify Hospitals
            </Button>
          </div>
          <Button onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
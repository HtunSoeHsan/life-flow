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
  Progress,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Spin
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  WarningOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  DropboxOutlined,
  HeartOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import { useInventory, useBloodUnits } from '@/hooks/useApi';
import { apiService } from '@/lib/api';
import AddBloodUnit from './AddBloodUnit';
import BloodUnitDetails from './BloodUnitDetails';
import ExpiryAlerts from './ExpiryAlerts';
import UpdateTestResults from './UpdateTestResults';
import ChangeStatus from './ChangeStatus';
import IssueUnit from './IssueUnit';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface BloodInventoryProps {
  hospitalId?: string;
}

export default function BloodInventory({ hospitalId: propHospitalId }: BloodInventoryProps) {
  const [hospitalId, setHospitalId] = useState<string>('');

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
  }, [propHospitalId]);

  const { inventory, loading: inventoryLoading, error: inventoryError, createBloodUnit, updateUnitStatus, refetch: refetchInventory } = useInventory(hospitalId);
  const { bloodUnits, loading: unitsLoading, error: unitsError, refetch } = useBloodUnits({ hospitalId });
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [showEditUnit, setShowEditUnit] = useState(false);
  const [showUpdateTests, setShowUpdateTests] = useState(false);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showIssueUnit, setShowIssueUnit] = useState(false);
  const [showExpiryAlerts, setShowExpiryAlerts] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const handleAddUnit = async (unitData: any) => {
    try {
      setSubmitting(true);
      await createBloodUnit({
        donorId: unitData.donorId,
        bloodGroup: unitData.bloodGroup,
        component: unitData.component,
        volume: unitData.volume,
        collectionDate: unitData.collectionDate.toISOString(),
        location: unitData.location || 'Main Storage',
        batchNumber: unitData.batchNumber || `BATCH${Date.now()}`
      });
      message.success('Blood unit added successfully');
      setShowAddUnit(false);
    } catch (error) {
      message.error('Failed to add blood unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (unitId: string, newStatus: string) => {
    try {
      await updateUnitStatus(unitId, newStatus);
      message.success('Unit status updated successfully');
    } catch (error) {
      message.error('Failed to update unit status');
    }
  };

  if (inventoryLoading || unitsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (inventoryError || unitsError) {
    return (
      <Alert
        message="Error"
        description={inventoryError || unitsError}
        type="error"
        showIcon
      />
    );
  }



  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['Whole Blood', 'Red Blood Cells', 'Plasma', 'Platelets'];
  const statuses = ['Available', 'Reserved', 'Issued', 'Expired', 'Quarantine'];

  const totalUnits = bloodUnits.length;
  const availableUnits = bloodUnits.filter((unit: any) => unit.status === 'Available').length;
  const reservedUnits = bloodUnits.filter((unit: any) => unit.status === 'Reserved').length;
  const expiringUnits = bloodUnits.filter((unit: any) => {
    const expiryDate = dayjs(unit.expiryDate);
    const sevenDaysFromNow = dayjs().add(7, 'day');
    return expiryDate.isBefore(sevenDaysFromNow) && unit.status === 'Available';
  }).length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Available': 'green',
      'Reserved': 'blue',
      'Issued': 'purple',
      'Expired': 'red',
      'Quarantine': 'orange'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Unit Info',
      key: 'unitInfo',
      width: 200,
      render: (record: any) => (
        <div>
          <div className="font-medium flex items-center space-x-2">
            <BarcodeOutlined className="text-blue-500" />
            <span>{record.unitId}</span>
          </div>
          <div className="text-sm text-gray-500">Batch: {record.batchNumber}</div>
          <div className="flex items-center space-x-2 mt-1">
            <Tag color="red">{record.bloodGroup}</Tag>
            <Tag color="blue">{record.component}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Donor',
      key: 'donor',
      width: 150,
      render: (record: any) => {
        console.log("Rendering donor info for record:", record);
        return (
        <div>
          <div className="font-medium">{record.donor ? `${record.donor.firstName} ${record.donor.lastName}` : 'Unknown Donor'}</div>
          <div className="text-sm text-gray-500">{record.donor?.donorId || 'N/A'}</div>
        </div>
        );
      },
    },
    {
      title: 'Collection',
      key: 'collection',
      width: 120,
      render: (record: any) => (
        <div>
          <div className="text-sm">{dayjs(record.collectionDate).format('DD MMM YY')}</div>
          <div className="text-sm text-gray-500">{record.volume}ml</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (record: any) => (
        <div className="text-center">
          <Tag color={getStatusColor(record.status)}>
            {record.status}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            {record.location}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedUnit(record);
              setShowUnitDetails(true);
            }}
          >
            View
          </Button>
          <Button 
            type="link" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUnit(record);
              setShowEditUnit(true);
            }}
          >
            Edit
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
              title="Total Units"
              value={totalUnits}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={inventoryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Available"
              value={availableUnits}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={inventoryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Reserved"
              value={reservedUnits}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={inventoryLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringUnits}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={inventoryLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Inventory Overview */}
      <Card title="Blood Type Inventory">
        <Row gutter={[16, 16]}>
          {inventory.map((item: any) => (
            <Col xs={12} sm={8} md={6} key={item.bloodType}>
              <Card size="small" className="text-center">
                <div className="mb-2">
                  <div className="text-2xl font-bold text-red-600">
                    {item.bloodType}
                  </div>
                  <div className="text-sm text-gray-500">Blood Type</div>
                </div>
                <div className="mb-2">
                  <div className="text-lg font-semibold">{item.total || item.available}</div>
                  <div className="text-xs text-gray-500">Units Available</div>
                </div>
                {item.expiring > 0 && (
                  <div className="text-xs text-orange-500 mt-1">
                    {item.expiring} expiring soon
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Inventory Management" key="inventory">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-4">
                <Input
                  placeholder="Search units..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                
                <Select
                  placeholder="Blood Group"
                  value={filterBloodGroup}
                  onChange={setFilterBloodGroup}
                  style={{ width: 120 }}
                  allowClear
                >
                  {bloodGroups.map(group => (
                    <Option key={group} value={group}>{group}</Option>
                  ))}
                </Select>

                <Select
                  placeholder="Component"
                  value={filterComponent}
                  onChange={setFilterComponent}
                  style={{ width: 150 }}
                  allowClear
                >
                  {components.map(component => (
                    <Option key={component} value={component}>{component}</Option>
                  ))}
                </Select>

                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  allowClear
                >
                  {statuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button icon={<ExportOutlined />}>Export</Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddUnit(true)}
                  loading={submitting}
                >
                  Add Blood Unit
                </Button>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={bloodUnits}
              pagination={{
                total: bloodUnits.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} units`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Blood Group Distribution">
                <Column
                  data={bloodGroups.map(group => ({
                    bloodGroup: group,
                    count: bloodUnits.filter((unit: any) => unit.bloodGroup === group).length
                  }))}
                  xField="bloodGroup"
                  yField="count"
                  color="#dc2626"
                  height={300}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Component Distribution">
                <Pie
                  data={components.map(component => ({
                    component,
                    count: bloodUnits.filter((unit: any) => unit.component === component).length
                  })).filter(item => item.count > 0)}
                  angleField="count"
                  colorField="component"
                  radius={0.8}
                  height={300}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Modals */}
      <AddBloodUnit
        visible={showAddUnit}
        onCancel={() => setShowAddUnit(false)}
        onSubmit={handleAddUnit}
      />

      <BloodUnitDetails
        visible={showUnitDetails}
        onCancel={() => setShowUnitDetails(false)}
        unit={selectedUnit}
        onEdit={(unit) => {
          setSelectedUnit(unit);
          setShowEditUnit(true);
        }}
        onUpdateTests={(unit) => {
          setSelectedUnit(unit);
          setShowUpdateTests(true);
        }}
        onChangeStatus={(unit) => {
          setSelectedUnit(unit);
          setShowChangeStatus(true);
        }}
        onIssue={(unit) => {
          setSelectedUnit(unit);
          setShowIssueUnit(true);
        }}
      />

      <ExpiryAlerts
        visible={showExpiryAlerts}
        onCancel={() => setShowExpiryAlerts(false)}
        units={bloodUnits.filter((u: any) => {
          const daysUntilExpiry = dayjs(u.expiryDate).diff(dayjs(), 'day');
          return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        })}
      />

      {/* Edit Blood Unit Modal */}
      <AddBloodUnit
        visible={showEditUnit}
        onCancel={() => setShowEditUnit(false)}
        onSubmit={(data) => {
          // Handle edit submission
          setShowEditUnit(false);
        }}
        mode="edit"
        initialData={selectedUnit}
      />

      {/* Update Tests Modal */}
      <UpdateTestResults
        visible={showUpdateTests}
        onCancel={() => setShowUpdateTests(false)}
        onSubmit={async (testResults) => {
          try {
            await apiService.updateTestResults(selectedUnit.id, testResults, hospitalId);
            refetch();
            setShowUpdateTests(false);
          } catch (error) {
            message.error('Failed to update test results');
          }
        }}
        unit={selectedUnit}
      />

      {/* Change Status Modal */}
      <ChangeStatus
        visible={showChangeStatus}
        onCancel={() => setShowChangeStatus(false)}
        onSubmit={async (statusData) => {
          try {
            await updateUnitStatus(selectedUnit.id, statusData.status, statusData.notes);
            refetch();
            setShowChangeStatus(false);
          } catch (error) {
            message.error('Failed to change status');
          }
        }}
        unit={selectedUnit}
      />

      {/* Issue Unit Modal */}
      <IssueUnit
        visible={showIssueUnit}
        onCancel={() => setShowIssueUnit(false)}
        onSubmit={async (issueData) => {
          try {
            await apiService.issueBloodUnit(selectedUnit.id, issueData, hospitalId);
            refetch();
            setShowIssueUnit(false);
          } catch (error) {
            message.error('Failed to issue unit');
          }
        }}
        unit={selectedUnit}
      />
    </div>
  );
}
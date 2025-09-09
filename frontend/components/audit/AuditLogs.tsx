'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Statistic,
  Button,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiService } from '../../lib/api';

const { RangePicker } = DatePicker;

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
  ipAddress?: string;
}

interface AuditLogsProps {
  hospitalId?: string;
}

export default function AuditLogs({ hospitalId }: AuditLogsProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    topActions: [],
    topUsers: []
  });

  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [hospitalId, userFilter, actionFilter, entityTypeFilter, dateRange, pagination.page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        hospitalId,
        page: pagination.page,
        limit: pagination.limit
      };

      if (userFilter) params.userId = userFilter;
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entityType = entityTypeFilter;
      if (dateRange.length === 2) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const data = await apiService.getAuditLogs(params);

      if (data.success) {
        setAuditLogs(data.data.auditLogs);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const data = await apiService.getAuditStats(hospitalId);

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'green',
      'UPDATE': 'blue',
      'DELETE': 'red',
      'LOGIN': 'purple',
      'LOGOUT': 'orange',
      'VIEW': 'cyan'
    };
    return colors[action.toUpperCase()] || 'default';
  };

  const formatActionSentence = (record: AuditLog) => {
    const { action, entityType, newValues } = record;
    
    if (action === 'CREATE') {
      const name = newValues?.firstName && newValues?.lastName 
        ? `${newValues.firstName} ${newValues.lastName}`
        : newValues?.name || newValues?.email || 'new record';
      return `Created ${entityType.toLowerCase()} "${name}"`;
    }
    
    if (action === 'UPDATE') {
      return `Updated ${entityType.toLowerCase()}`;
    }
    
    if (action === 'DELETE') {
      return `Deleted ${entityType.toLowerCase()}`;
    }
    
    return `${action} ${entityType.toLowerCase()}`;
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <div>
          <div>{dayjs(timestamp).format('DD MMM YYYY')}</div>
          <div className="text-xs text-gray-500">{dayjs(timestamp).format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (record: AuditLog) => {
        const userName = record.userEmail.includes('@') 
          ? record.userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : 'Unknown User';
        
        return (
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-gray-400" />
            <div>
              <div className="font-medium">{userName}</div>
              <div className="text-xs text-gray-500">{record.userEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
    },
    {
      title: 'Entity',
      key: 'entity',
      width: 150,
      render: (record: AuditLog) => (
        <div>
          <div className="font-medium">{record.entityType}</div>
          {record.entityId && (
            <div className="text-xs text-gray-500">{record.entityId}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Action Details',
      key: 'actionDetails',
      width: 200,
      render: (record: AuditLog) => (
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">{formatActionSentence(record)}</div>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              setSelectedRecord(record);
              setModalVisible(true);
            }}
          />
        </div>
      ),
    },
    {
      title: 'Agent Details',
      key: 'agentDetails',
      width: 200,
      render: (record: AuditLog) => (
        <div className="text-xs text-gray-600">
          {record.userAgent && (
            <div className="mb-1">
              <span className="font-medium">Browser:</span>
              <div>{record.userAgent.includes('curl') ? 'API Client' : record.userAgent.split(' ')[0]}</div>
            </div>
          )}
          {record.ipAddress && (
            <div>
              <span className="font-medium">IP:</span> {record.ipAddress}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Audit Logs"
              value={stats.totalLogs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Today's Activities"
              value={stats.todayLogs}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={stats.topUsers.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Action Types"
              value={stats.topActions.length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Space size="middle">
            <Input
              placeholder="Search by user email..."
              prefix={<SearchOutlined />}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Action"
              value={actionFilter || undefined}
              onChange={setActionFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Select.Option value="CREATE">Create</Select.Option>
              <Select.Option value="UPDATE">Update</Select.Option>
              <Select.Option value="DELETE">Delete</Select.Option>
              <Select.Option value="LOGIN">Login</Select.Option>
              <Select.Option value="VIEW">View</Select.Option>
            </Select>
            <Select
              placeholder="Entity Type"
              value={entityTypeFilter || undefined}
              onChange={setEntityTypeFilter}
              allowClear
              style={{ width: 150 }}
            >
              <Select.Option value="Donor">Donor</Select.Option>
              <Select.Option value="Collection">Collection</Select.Option>
              <Select.Option value="BloodUnit">Blood Unit</Select.Option>
              <Select.Option value="Distribution">Distribution</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 250 }}
            />
          </Space>
          <Button icon={<ExportOutlined />}>Export</Button>
        </div>

        <Table
          columns={columns}
          dataSource={auditLogs}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, page, limit: pageSize || 50 }));
            }
          }}
        />
      </Card>

      <Modal
        title="Action Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{formatActionSentence(selectedRecord)}</h3>
              <p className="text-gray-500">by {selectedRecord.userEmail} at {dayjs(selectedRecord.timestamp).format('DD MMM YYYY HH:mm:ss')}</p>
            </div>
            
            {(selectedRecord.action === 'UPDATE' || selectedRecord.action === 'CREATE') && selectedRecord.newValues && (
              <div>
                <h4 className="font-medium mb-2">Changes Made:</h4>
                {Object.keys(selectedRecord.newValues).map(key => {
                  const oldVal = selectedRecord.oldValues?.[key];
                  const newVal = selectedRecord.newValues[key];
                  const hasChanged = selectedRecord.action === 'UPDATE' && oldVal !== newVal && oldVal !== null && oldVal !== undefined;
                  
                  const formatValue = (val: any) => {
                    if (val === null || val === undefined) return 'null';
                    if (typeof val === 'object') return JSON.stringify(val, null, 2);
                    return String(val);
                  };
                  
                  return (
                    <div key={key} className="mb-3 p-2 border rounded">
                      <div className="font-medium text-gray-700 mb-1">{key}:</div>
                      {selectedRecord.action === 'CREATE' ? (
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="text-blue-800">{formatValue(newVal)}</span>
                        </div>
                      ) : hasChanged ? (
                        <div className="space-y-2">
                          <div className="bg-red-50 p-2 rounded">
                            <span className="text-red-800">Old: {formatValue(oldVal)}</span>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="text-green-800">New: {formatValue(newVal)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">{formatValue(newVal)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
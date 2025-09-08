'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, message, Space, Tag, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import DonorRegistration from './DonorRegistration';

const { Option } = Select;

interface DonorManagementProps {
  hospitalId?: string;
}

export default function DonorManagement({ hospitalId: propHospitalId }: DonorManagementProps) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const fetchDonors = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchText) params.append('search', searchText);
      if (filterBloodGroup) params.append('bloodGroup', filterBloodGroup);
      
      const response = await fetch(`http://localhost:3001/api/donors?${params}`, {
        headers: { 'x-hospital-id': hospitalId || 'default-hospital' }
      });
      const data = await response.json();
      if (data.success) {
        setDonors(data.data.donors || []);
        setPagination(data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      message.error('Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchDonors(1);
    }
  }, [hospitalId, searchText, filterBloodGroup]);

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    fetchDonors();
    message.success('Donor registered successfully');
  };

  const columns = [
    {
      title: 'Donor Info',
      render: (record: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold">{record.firstName} {record.lastName}</div>
            <div className="text-sm text-gray-500">{record.donorId}</div>
          </div>
        </div>
      ),
      width: '25%'
    },
    {
      title: 'Contact',
      render: (record: any) => (
        <div>
          <div>{record.email}</div>
          <div className="text-sm text-gray-500">{record.phone}</div>
        </div>
      ),
      width: '20%'
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroup',
      render: (bloodGroup: string) => (
        <Tag color="red" className="font-semibold">{bloodGroup}</Tag>
      ),
      width: '15%'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      width: '15%'
    },
    {
      title: 'Last Donation',
      dataIndex: 'lastDonationDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
      width: '15%'
    },
    {
      title: 'Actions',
      render: (record: any) => (
        <Space>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedDonor(record);
              setShowViewModal(true);
            }}
          >
            View
          </Button>
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              setSelectedDonor(record);
              setShowEditModal(true);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
      width: '10%'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Donor Management</h3>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowRegisterModal(true)}
          >
            Register New Donor
          </Button>
        </div>

        <div className="flex space-x-4 mb-4">
          <Input
            placeholder="Search donors..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Blood Group"
            value={filterBloodGroup}
            onChange={setFilterBloodGroup}
            style={{ width: 200 }}
            allowClear
          >
            {bloodGroups.map(group => (
              <Option key={group} value={group}>{group}</Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={donors}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} donors`,
            onChange: (page) => fetchDonors(page)
          }}
        />
      </Card>

      <DonorRegistration
        visible={showRegisterModal}
        onCancel={() => setShowRegisterModal(false)}
        onSubmit={handleRegisterSuccess}
        hospitalId={hospitalId}
      />

      {/* View Donor Modal */}
      <DonorRegistration
        visible={showViewModal}
        onCancel={() => setShowViewModal(false)}
        onSubmit={() => {}}
        hospitalId={hospitalId}
        mode="view"
        initialData={selectedDonor}
      />

      {/* Edit Donor Modal */}
      <DonorRegistration
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onSubmit={() => {
          setShowEditModal(false);
          fetchDonors();
        }}
        hospitalId={hospitalId}
        mode="edit"
        initialData={selectedDonor}
      />
    </div>
  );
}
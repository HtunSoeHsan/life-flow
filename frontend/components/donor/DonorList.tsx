'use client';

import { useState } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Avatar, 
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
  DatePicker
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  UserOutlined, 
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  FilterOutlined,
  ExportOutlined,
  HeartOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import DonorRegistration from './DonorRegistration';
import DonorProfile from './DonorProfile';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function DonorList() {
  const [donors, setDonors] = useState([
    {
      key: 1,
      donorId: 'D1704067200000',
      firstName: 'John',
      lastName: 'Doe',
      bloodGroup: 'O+',
      age: 28,
      gender: 'Male',
      phone: '+1234567890',
      email: 'john.doe@email.com',
      address: '123 Main St, City, State',
      weight: 70,
      occupation: 'Engineer',
      registrationDate: '2024-01-01',
      lastDonationDate: '2024-01-15',
      totalDonations: 5,
      rewardPoints: 250,
      isEligible: true,
      status: 'Active',
      emergencyDonor: true,
      notifications: true,
      preferredDonationTime: 'morning',
      hasChronicDisease: false,
      recentMedication: false,
      emergencyContact: '+1234567891'
    },
    {
      key: 2,
      donorId: 'D1704067200001',
      firstName: 'Jane',
      lastName: 'Smith',
      bloodGroup: 'A+',
      age: 32,
      gender: 'Female',
      phone: '+1234567892',
      email: 'jane.smith@email.com',
      address: '456 Oak Ave, City, State',
      weight: 58,
      occupation: 'Doctor',
      registrationDate: '2023-12-15',
      lastDonationDate: '2023-11-20',
      totalDonations: 8,
      rewardPoints: 400,
      isEligible: false,
      status: 'Active',
      emergencyDonor: true,
      notifications: true,
      preferredDonationTime: 'afternoon',
      hasChronicDisease: false,
      recentMedication: false,
      emergencyContact: '+1234567893'
    },
    {
      key: 3,
      donorId: 'D1704067200002',
      firstName: 'Mike',
      lastName: 'Johnson',
      bloodGroup: 'B-',
      age: 25,
      gender: 'Male',
      phone: '+1234567894',
      email: 'mike.johnson@email.com',
      address: '789 Pine St, City, State',
      weight: 75,
      occupation: 'Teacher',
      registrationDate: '2024-02-10',
      lastDonationDate: null,
      totalDonations: 0,
      rewardPoints: 0,
      isEligible: true,
      status: 'New',
      emergencyDonor: false,
      notifications: true,
      preferredDonationTime: 'evening',
      hasChronicDisease: false,
      recentMedication: false,
      emergencyContact: '+1234567895'
    }
  ]);

  const [filteredDonors, setFilteredDonors] = useState(donors);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, filterBloodGroup, filterStatus, filterEligibility);
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'bloodGroup':
        setFilterBloodGroup(value);
        applyFilters(searchText, value, filterStatus, filterEligibility);
        break;
      case 'status':
        setFilterStatus(value);
        applyFilters(searchText, filterBloodGroup, value, filterEligibility);
        break;
      case 'eligibility':
        setFilterEligibility(value);
        applyFilters(searchText, filterBloodGroup, filterStatus, value);
        break;
    }
  };

  const applyFilters = (search: string, bloodGroup: string, status: string, eligibility: string) => {
    let filtered = donors;

    if (search) {
      filtered = filtered.filter(donor =>
        donor.firstName.toLowerCase().includes(search.toLowerCase()) ||
        donor.lastName.toLowerCase().includes(search.toLowerCase()) ||
        donor.donorId.toLowerCase().includes(search.toLowerCase()) ||
        donor.email.toLowerCase().includes(search.toLowerCase()) ||
        donor.phone.includes(search)
      );
    }

    if (bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === bloodGroup);
    }

    if (status) {
      filtered = filtered.filter(donor => donor.status === status);
    }

    if (eligibility) {
      const isEligible = eligibility === 'eligible';
      filtered = filtered.filter(donor => donor.isEligible === isEligible);
    }

    setFilteredDonors(filtered);
  };

  const handleDonorRegistration = (donorData: any) => {
    const newDonor = {
      ...donorData,
      key: donors.length + 1,
      totalDonations: 0,
      rewardPoints: 0,
      status: 'New'
    };
    
    const updatedDonors = [...donors, newDonor];
    setDonors(updatedDonors);
    setFilteredDonors(updatedDonors);
    setShowRegistration(false);
  };

  const getDonationEligibilityStatus = (donor: any) => {
    if (!donor.lastDonationDate) return { status: 'eligible', text: 'Eligible', color: 'green' };
    
    const daysSinceLastDonation = dayjs().diff(dayjs(donor.lastDonationDate), 'day');
    const requiredGap = 90;
    
    if (daysSinceLastDonation >= requiredGap) {
      return { status: 'eligible', text: 'Eligible', color: 'green' };
    } else {
      const remainingDays = requiredGap - daysSinceLastDonation;
      return { 
        status: 'waiting', 
        text: `${remainingDays}d left`, 
        color: 'orange' 
      };
    }
  };

  const columns = [
    {
      title: 'Donor Info',
      key: 'donorInfo',
      width: 250,
      render: (record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.firstName} {record.lastName}</div>
            <div className="text-xs text-gray-500">{record.donorId}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Tag color="red">{record.bloodGroup}</Tag>
              <Tag color={record.status === 'Active' ? 'green' : 'blue'} >
                {record.status}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <PhoneOutlined className="text-blue-500" />
            <span>{record.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MailOutlined className="text-green-500" />
            <span className="truncate">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Demographics',
      key: 'demographics',
      width: 120,
      render: (record: any) => (
        <div className="text-sm">
          <div>{record.age} years</div>
          <div className="text-gray-500">{record.gender}</div>
          <div className="text-gray-500">{record.weight} kg</div>
        </div>
      ),
    },
    {
      title: 'Donation Stats',
      key: 'donationStats',
      width: 150,
      render: (record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HeartOutlined className="text-red-500" />
            <span className="text-sm font-medium">{record.totalDonations} donations</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrophyOutlined className="text-yellow-500" />
            <span className="text-sm">{record.rewardPoints} points</span>
          </div>
          <div className="text-xs text-gray-500">
            Last: {record.lastDonationDate ? dayjs(record.lastDonationDate).format('DD MMM YY') : 'Never'}
          </div>
        </div>
      ),
    },
    {
      title: 'Eligibility',
      key: 'eligibility',
      width: 120,
      render: (record: any) => {
        const eligibility = getDonationEligibilityStatus(record);
        return (
          <div className="text-center">
            <Tag 
              color={eligibility.color}
              icon={eligibility.status === 'eligible' ? <HeartOutlined /> : <ClockCircleOutlined />}
            >
              {eligibility.text}
            </Tag>
            {record.emergencyDonor && (
              <div className="mt-1">
                <Badge status="processing" text="Emergency" />
              </div>
            )}
          </div>
        );
      },
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
            onClick={() => {
              setSelectedDonor(record);
              setShowProfile(true);
            }}
          >
            View Profile
          </Button>
          <Button type="link" size="small">
            Schedule
          </Button>
          <Button type="link" size="small">
            Contact
          </Button>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const totalDonors = donors.length;
  const activeDonors = donors.filter(d => d.status === 'Active').length;
  const eligibleDonors = donors.filter(d => d.isEligible).length;
  const emergencyDonors = donors.filter(d => d.emergencyDonor).length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Donors"
              value={totalDonors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Donors"
              value={activeDonors}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Eligible Now"
              value={eligibleDonors}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Emergency Donors"
              value={emergencyDonors}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search donors..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e: any) => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
            
            <Select
              placeholder="Blood Group"
              value={filterBloodGroup}
              onChange={(value: any) => handleFilterChange('bloodGroup', value)}
              style={{ width: 120 }}
              allowClear
            >
              {bloodGroups.map(group => (
                <Option key={group} value={group}>{group}</Option>
              ))}
            </Select>

            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={(value: any) => handleFilterChange('status', value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="Active">Active</Option>
              <Option value="New">New</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>

            <Select
              placeholder="Eligibility"
              value={filterEligibility}
              onChange={(value: any) => handleFilterChange('eligibility', value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="eligible">Eligible</Option>
              <Option value="not-eligible">Not Eligible</Option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowRegistration(true)}
            >
              Register Donor
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDonors}
          pagination={{
            total: filteredDonors.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: any, range: any) => `${range[0]}-${range[1]} of ${total} donors`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <DonorRegistration
        visible={showRegistration}
        onCancel={() => setShowRegistration(false)}
        onSubmit={handleDonorRegistration}
      />

      <DonorProfile
        visible={showProfile}
        onCancel={() => setShowProfile(false)}
        donor={selectedDonor}
      />
    </div>
  );
}
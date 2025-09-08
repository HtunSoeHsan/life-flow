'use client';

import { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  DatePicker, 
  Statistic,
  Tabs,
  message
} from 'antd';
import {
  FileTextOutlined,
  PrinterOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { TrendingDown } from 'lucide-react';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [reportType, setReportType] = useState('summary');

  // Sample data for charts
  const donationTrends = [
    { date: '2024-01-01', donations: 45, target: 50 },
    { date: '2024-01-02', donations: 52, target: 50 },
    { date: '2024-01-03', donations: 38, target: 50 },
    { date: '2024-01-04', donations: 61, target: 50 },
    { date: '2024-01-05', donations: 48, target: 50 },
    { date: '2024-01-06', donations: 55, target: 50 },
    { date: '2024-01-07', donations: 42, target: 50 },
  ];

  const bloodGroupDistribution = [
    { bloodGroup: 'O+', count: 145, percentage: 35 },
    { bloodGroup: 'A+', count: 112, percentage: 28 },
    { bloodGroup: 'B+', count: 72, percentage: 18 },
    { bloodGroup: 'AB+', count: 32, percentage: 8 },
    { bloodGroup: 'O-', count: 24, percentage: 6 },
    { bloodGroup: 'A-', count: 12, percentage: 3 },
    { bloodGroup: 'B-', count: 8, percentage: 2 },
    { bloodGroup: 'AB-', count: 4, percentage: 1 },
  ];

  const hospitalRequests = [
    { hospital: 'City General', requests: 45, fulfilled: 42, percentage: 93 },
    { hospital: 'Regional Medical', requests: 32, fulfilled: 30, percentage: 94 },
    { hospital: 'Children\'s Hospital', requests: 28, fulfilled: 26, percentage: 93 },
    { hospital: 'Emergency Center', requests: 38, fulfilled: 35, percentage: 92 },
    { hospital: 'Trauma Unit', requests: 22, fulfilled: 20, percentage: 91 },
  ];

  const inventoryTurnover = [
    { component: 'Whole Blood', turnover: 85, target: 80 },
    { component: 'Red Blood Cells', turnover: 92, target: 85 },
    { component: 'Plasma', turnover: 78, target: 75 },
    { component: 'Platelets', turnover: 95, target: 90 },
    { component: 'Cryoprecipitate', turnover: 72, target: 70 },
  ];

  const donorDemographics = [
    { ageGroup: '18-25', count: 85, percentage: 25 },
    { ageGroup: '26-35', count: 120, percentage: 35 },
    { ageGroup: '36-45', count: 95, percentage: 28 },
    { ageGroup: '46-55', count: 32, percentage: 9 },
    { ageGroup: '56-65', count: 10, percentage: 3 },
  ];

  const qualityMetrics = [
    { metric: 'Collection Success Rate', value: 98.5, target: 95 },
    { metric: 'Test Pass Rate', value: 99.2, target: 98 },
    { metric: 'Storage Compliance', value: 99.8, target: 99 },
    { metric: 'Delivery Success Rate', value: 97.3, target: 95 },
    { metric: 'Customer Satisfaction', value: 4.8, target: 4.5 },
  ];

  const generateReport = () => {
    message.success('Report generated successfully!');
  };

  const exportData = (format: string) => {
    message.success(`Data exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <RangePicker 
                // value={dateRange}
                // onChange={setDateRange}
                style={{ width: 250 }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <Select 
                value={reportType}
                onChange={setReportType}
                style={{ width: 150 }}
              >
                <Option value="summary">Summary</Option>
                <Option value="detailed">Detailed</Option>
                <Option value="comparative">Comparative</Option>
                <Option value="trend">Trend Analysis</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filter By</label>
              <Select placeholder="Select filter" style={{ width: 150 }}>
                <Option value="all">All Data</Option>
                <Option value="donors">Donors Only</Option>
                <Option value="inventory">Inventory Only</Option>
                <Option value="hospitals">Hospitals Only</Option>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<FilterOutlined />}>Advanced Filters</Button>
            <Button icon={<ExportOutlined />} onClick={() => exportData('excel')}>
              Export Excel
            </Button>
            <Button icon={<PrinterOutlined />}>Print Report</Button>
            <Button type="primary" icon={<FileTextOutlined />} onClick={generateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
  {
    key: 'overview',
    label: 'Overview Dashboard',
    children: (
      <Row gutter={[24, 24]}>
        {/* Key Performance Indicators */}
        <Col span={24}>
          <Card title="Key Performance Indicators">
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Total Donations"
                    value={1247}
                    prefix={<TrendingDown />}
                    valueStyle={{ color: '#3f8600' }}
                    suffix={
                      <span className="text-sm">
                        <span className="text-green-600">+12%</span> vs last month
                      </span>
                    }
                  />
                </Card>
              </Col>
              {/* Other KPIs remain unchanged */}
            </Row>
          </Card>
        </Col>
        {/* Donation Trends, Blood Group Distribution, Hospital Requests remain unchanged */}
      </Row>
    ),
  },
  {
    key: 'donations',
    label: 'Donation Analytics',
    children: (
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Donor Demographics">
            {/* Chart component here */}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Monthly Donation Targets">
            {/* Gauge chart and stats */}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Donation Patterns">
            {/* Area chart */}
          </Card>
        </Col>
      </Row>
    ),
  },
  {
    key: 'inventory',
    label: 'Inventory Reports',
    children: (
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Inventory Turnover Rate">
            {/* Column chart */}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Stock Levels by Component">
            {/* Radar chart */}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Expiry Analysis">
            {/* Table */}
          </Card>
        </Col>
      </Row>
    ),
  },
  {
    key: 'quality',
    label: 'Quality Metrics',
    children: (
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Quality Performance Indicators">
            {/* Row of metrics */}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Quality Trends">
            {/* Line chart */}
          </Card>
        </Col>
      </Row>
    ),
  },
  {
    key: 'custom',
    label: 'Custom Reports',
    children: (
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card title="Report Builder">
            {/* Report form fields */}
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Saved Reports">
            {/* Table of saved reports */}
          </Card>
        </Col>
      </Row>
    ),
  },
]} />
    </div>
  );
}
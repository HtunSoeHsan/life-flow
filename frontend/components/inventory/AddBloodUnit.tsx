'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Radio, Button, Row, Col, Divider, message } from 'antd';
import { BarcodeOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { Textarea } from '../ui/textarea';

const { Option } = Select;

interface BloodUnitData {
  donorId: string;
  donorName: string;
  bloodGroup: string;
  component: string;
  volume: number;
  collectionDate: Dayjs;
  location: string;
  collectionMethod: string;
  collectionBagType: string;
  anticoagulant: string;
  visualInspection: string;
  notes?: string;
}

interface ProcessedBloodUnit extends BloodUnitData {
  expiryDate: string;
  batchNumber: string;
  testResults: {
    hiv: string;
    hbv: string;
    hcv: string;
    syphilis: string;
  };
  crossMatchStatus: string;
  quarantineStatus: string;
  temperature: number;
}

interface AddBloodUnitProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: ProcessedBloodUnit) => Promise<void> | void;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export default function AddBloodUnit({ visible, onCancel, onSubmit, mode = 'create', initialData }: AddBloodUnitProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [donorInfo, setDonorInfo] = useState<any>(null);
  const [searchingDonor, setSearchingDonor] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.setFieldsValue({
        ...initialData,
        donorId: initialData.donor?.donorId || '',
        collectionDate: initialData.collectionDate ? dayjs(initialData.collectionDate) : dayjs(),
      });
      if (initialData.donor) {
        setDonorInfo(initialData.donor);
      }
    }
  }, [initialData, mode, form]);

  const searchDonor = async (donorId: string) => {
    if (!donorId) {
      setDonorInfo(null);
      return;
    }
    
    try {
      setSearchingDonor(true);
      const response = await fetch(`http://localhost:3001/api/donors?search=${donorId}`, {
        headers: { 'x-hospital-id': localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).user.hospitalId : '' }
      });
      const data = await response.json();
      if (data.success && data.data.donors.length > 0) {
        const donor = data.data.donors.find((d: any) => d.donorId === donorId);
        if (donor) {
          setDonorInfo(donor);
          form.setFieldsValue({
            bloodGroup: donor.bloodGroup
          });
        } else {
          setDonorInfo(null);
          message.warning('Donor not found');
        }
      } else {
        setDonorInfo(null);
        message.warning('Donor not found');
      }
    } catch (error) {
      setDonorInfo(null);
      message.error('Failed to search donor');
    } finally {
      setSearchingDonor(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['Whole Blood', 'Red Blood Cells', 'Plasma', 'Platelets', 'Cryoprecipitate'];
  const locations = [
    'Refrigerator-A1', 'Refrigerator-A2', 'Refrigerator-B1', 'Refrigerator-B2',
    'Freezer-B1', 'Freezer-B2', 'Agitator-C1', 'Agitator-C2', 'Quarantine-Q1', 'Quarantine-Q2'
  ];

  const handleSubmit = async (values: BloodUnitData) => {
    setLoading(true);
    try {
      // Calculate expiry date based on component
      const expiryDate = calculateExpiryDate(values.collectionDate, values.component);
      
      const unitData: ProcessedBloodUnit = {
        ...values,
        expiryDate: expiryDate.format('YYYY-MM-DD'),
        batchNumber: generateBatchNumber(values.collectionDate),
        testResults: {
          hiv: 'Pending',
          hbv: 'Pending',
          hcv: 'Pending',
          syphilis: 'Pending'
        },
        crossMatchStatus: 'Pending',
        quarantineStatus: 'In Quarantine',
        temperature: getStorageTemperature(values.component)
      };

      console.log('Submitting Blood Unit:', unitData);
      await onSubmit(unitData);
      // form.resetFields();
      message.success('Blood unit added successfully!');
    } catch (error) {
      console.error('Error adding blood unit:', error);
      message.error('Failed to add blood unit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = (collectionDate: Dayjs, component: string): Dayjs => {
    const expiryDays: Record<string, number> = {
      'Whole Blood': 35,
      'Red Blood Cells': 42,
      'Plasma': 365,
      'Platelets': 5,
      'Cryoprecipitate': 365
    };
    return collectionDate.add(expiryDays[component] || 35, 'day');
  };

  const generateBatchNumber = (collectionDate: Dayjs): string => {
    return `B${collectionDate.format('YYMMDD')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const getStorageTemperature = (component: string): number => {
    const temperatures: Record<string, number> = {
      'Whole Blood': 4.0,
      'Red Blood Cells': 4.0,
      'Plasma': -18.0,
      'Platelets': 22.0,
      'Cryoprecipitate': -18.0
    };
    return temperatures[component] || 4.0;
  };

  return (
    <Modal
      title={mode === 'edit' ? 'Edit Blood Unit' : 'Add New Blood Unit'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form<BloodUnitData>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData ? {
          ...initialData,
          collectionDate: initialData.collectionDate ? dayjs(initialData.collectionDate) : dayjs(),
        } : {
          bloodGroup: 'O+',
          component: 'Whole Blood',
          volume: 450,
          collectionDate: dayjs(),
        }}
      >
        <Divider orientation="left">Donor Information</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="donorId"
              label="Donor ID"
              rules={[{ required: true, message: 'Please enter donor ID' }]}
            >
              <Input 
                placeholder="Enter donor ID" 
                prefix={<UserOutlined />}
                onBlur={(e) => searchDonor(e.target.value)}
                loading={searchingDonor}
                disabled={mode === 'edit'}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Donor Name"
            >
              <Input 
                value={donorInfo ? `${donorInfo.firstName} ${donorInfo.lastName}` : ''}
                placeholder="Donor name will appear here"
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Blood Unit Details</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bloodGroup"
              label="Blood Group"
              rules={[{ required: true, message: 'Please select blood group' }]}
            >
              <Select>
                {bloodGroups.map(group => (
                  <Option key={group} value={group}>{group}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="component"
              label="Blood Component"
              rules={[{ required: true, message: 'Please select component' }]}
            >
              <Select>
                {components.map(component => (
                  <Option key={component} value={component}>{component}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="collectionDate"
              label="Collection Date"
              rules={[{ required: true, message: 'Please select collection date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={(current) => current ? current > dayjs().endOf('day') : false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="volume"
              label="Volume (ml)"
              rules={[
                { required: true, message: 'Please enter volume' },
                { type: 'number', min: 100, max: 500, message: 'Volume must be between 100-500 ml' }
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                placeholder="Enter volume in ml"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Storage Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Storage Location"
              rules={[{ required: true, message: 'Please select storage location' }]}
            >
              <Select>
                {locations.map(location => (
                  <Option key={location} value={location}>{location}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="collectionMethod"
              label="Collection Method"
              rules={[{ required: true, message: 'Please select collection method' }]}
            >
              <Select>
                <Option value="Voluntary">Voluntary Donation</Option>
                <Option value="Replacement">Replacement Donation</Option>
                <Option value="Autologous">Autologous Donation</Option>
                <Option value="Apheresis">Apheresis</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Quality Control</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="collectionBagType"
              label="Collection Bag Type"
              rules={[{ required: true, message: 'Please select bag type' }]}
            >
              <Select>
                <Option value="Single">Single Bag</Option>
                <Option value="Double">Double Bag</Option>
                <Option value="Triple">Triple Bag</Option>
                <Option value="Quadruple">Quadruple Bag</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="anticoagulant"
              label="Anticoagulant Used"
              rules={[{ required: true, message: 'Please select anticoagulant' }]}
            >
              <Select>
                <Option value="CPDA-1">CPDA-1</Option>
                <Option value="CPD">CPD</Option>
                <Option value="ACD">ACD</Option>
                <Option value="Heparin">Heparin</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="visualInspection"
          label="Visual Inspection"
          rules={[{ required: true, message: 'Please select visual inspection result' }]}
        >
          <Radio.Group>
            <Radio value="Normal">Normal - Clear, no clots or abnormal color</Radio>
            <Radio value="Abnormal">Abnormal - Visible issues detected</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Additional Notes"
        >
          <Textarea 
            rows={3} 
            placeholder="Enter any additional notes about the blood unit"
          />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'edit' ? 'Update Blood Unit' : 'Add Blood Unit'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
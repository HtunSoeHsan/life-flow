'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Radio, Checkbox, Button, Upload, message, Row, Col, Divider, Alert, Spin } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDonorRegistration } from '@/hooks/useApi';
import { apiService } from '@/lib/api';

const { Option } = Select;
const { TextArea } = Input;

interface DonorRegistrationProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  hospitalId?: string;
  mode?: 'create' | 'edit' | 'view';
  initialData?: any;
}

export default function DonorRegistration({ visible, onCancel, onSubmit, hospitalId, mode = 'create', initialData }: DonorRegistrationProps) {
  const [form] = Form.useForm();
  const { loading, error, registerDonor, checkEligibility } = useDonorRegistration(hospitalId);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  useEffect(() => {
    if (initialData && mode !== 'create') {
      form.setFieldsValue({
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? dayjs(initialData.dateOfBirth) : null,
        lastDonationDate: initialData.lastDonationDate ? dayjs(initialData.lastDonationDate) : null
      });
    }
  }, [initialData, mode, form]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];
  const occupations = ['Student', 'Teacher', 'Doctor', 'Engineer', 'Business', 'Government', 'Private', 'Other'];

  const handleSubmit = async (values: any) => {
    try {
      const donorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth.toISOString(),
        gender: values.gender,
        bloodGroup: values.bloodGroup,
        weight: parseInt(values.weight),
        address: values.address,
        occupation: values.occupation,
        emergencyContact: values.emergencyContact,
        medicalHistory: {
          hasChronicDisease: values.hasChronicDisease || false,
          chronicDiseaseDetails: values.chronicDiseaseDetails || '',
          recentMedication: values.recentMedication || false,
          isPregnant: values.isPregnant || false
        },
        preferences: {
          preferredDonationTime: values.preferredDonationTime || 'morning',
          notifications: values.notifications || false,
          emergencyDonor: values.emergencyDonor || false
        },
        rawFingerprintData: 'demo_fingerprint_data'
      };
      
      console.log("Registering donor with data:", donorData);
      let response;
      if (mode === 'edit') {
        response = await apiService.updateDonor(initialData.id, donorData, hospitalId);
        message.success('Donor updated successfully!');
      } else {
        response = await registerDonor(donorData, hospitalId);
        message.success('Donor registered successfully!');
      }
      
      if (response.success) {
        onSubmit(response.data);
        form.resetFields();
        setEligibilityResult(null);
      }
    } catch (error) {
      message.error(mode === 'edit' ? 'Update failed. Please try again.' : 'Registration failed. Please try again.');
    }
  };

  const handleEligibilityCheck = async () => {
    try {
      const values = await form.validateFields(['firstName', 'lastName', 'dateOfBirth', 'weight', 'bloodGroup', 'hasChronicDisease', 'recentMedication', 'isPregnant']);
      
      const donorData = {
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        weight: parseInt(values.weight),
        bloodGroup: values.bloodGroup,
        medicalHistory: {
          hasChronicDisease: values.hasChronicDisease || false,
          recentMedication: values.recentMedication || false,
          isPregnant: values.isPregnant || false
        }
      };
      const response = await checkEligibility(donorData);
      
      if (response.success) {
        setEligibilityResult(response.data);
        if (response.data.isEligible) {
          message.success('Donor is eligible for blood donation!');
        } else {
          message.warning(`Donor eligibility: ${response.data.summary}`);
        }
      }
    } catch (error) {
      message.error('Please fill in all required fields for eligibility check.');
    }
  };

  return (
    <Modal
      title={mode === 'view' ? 'Donor Details' : mode === 'edit' ? 'Edit Donor' : 'Donor Registration'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      {error && (
        <Alert
          message="Registration Error"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
      )}
      
      {eligibilityResult && (
        <Alert
          message={eligibilityResult.isEligible ? "Eligible for Donation" : "Eligibility Check Result"}
          description={eligibilityResult.summary}
          type={eligibilityResult.isEligible ? "success" : "warning"}
          showIcon
          className="mb-4"
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData ? {
          ...initialData,
          dateOfBirth: initialData.dateOfBirth ? dayjs(initialData.dateOfBirth) : null,
          lastDonationDate: initialData.lastDonationDate ? dayjs(initialData.lastDonationDate) : null,
          hasChronicDisease: initialData.hasChronicDisease || false,
          recentMedication: initialData.recentMedication || false,
          isPregnant: initialData.isPregnant || false,
          notifications: initialData.notifications || false,
          emergencyDonor: initialData.emergencyDonor || false
        } : {
          gender: 'Male',
          bloodGroup: 'O+',
        }}
        disabled={mode === 'view'}
      >
        <Divider orientation="left">Personal Information</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: 'Please select date of birth' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                disabledDate={(current: any) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select>
                {genders.map(gender => (
                  <Option key={gender} value={gender}>{gender}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
              name="weight"
              label="Weight (kg)"
              rules={[
                { required: true, message: 'Please enter weight' }
              ]}
            >
              <Input type="number" placeholder="Enter weight in kg" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Contact Information</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter phone number' },
                { pattern: /^[0-9]{10,15}$/, message: 'Please enter valid phone number' }
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <TextArea rows={3} placeholder="Enter complete address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="occupation"
              label="Occupation"
              rules={[{ required: true, message: 'Please select occupation' }]}
            >
              <Select>
                {occupations.map(occupation => (
                  <Option key={occupation} value={occupation}>{occupation}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="emergencyContact"
              label="Emergency Contact"
              rules={[{ required: true, message: 'Please enter emergency contact' }]}
            >
              <Input placeholder="Emergency contact number" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Medical Information</Divider>

        <Form.Item
          name="hasChronicDisease"
          label="Do you have any chronic diseases?"
          rules={[{ required: true, message: 'Please select an option' }]}
        >
          <Radio.Group>
            <Radio value={false}>No</Radio>
            <Radio value={true}>Yes</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="chronicDiseaseDetails"
          label="If yes, please specify"
          dependencies={['hasChronicDisease']}
          rules={[
            ({ getFieldValue }: {getFieldValue: any}) => ({
              required: getFieldValue('hasChronicDisease'),
              message: 'Please specify chronic disease details',
            }),
          ]}
        >
          <TextArea rows={2} placeholder="Specify chronic disease details" />
        </Form.Item>

        <Form.Item
          name="recentMedication"
          label="Are you currently taking any medication?"
          rules={[{ required: true, message: 'Please select an option' }]}
        >
          <Radio.Group>
            <Radio value={false}>No</Radio>
            <Radio value={true}>Yes</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="isPregnant"
          label="Are you pregnant or breastfeeding? (For female donors)"
          dependencies={['gender']}
          rules={[
            ({ getFieldValue }: {getFieldValue: any}) => ({
              required: getFieldValue('gender') === 'Female',
              message: 'Please select an option',
            }),
          ]}
        >
          <Radio.Group>
            <Radio value={false}>No</Radio>
            <Radio value={true}>Yes</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="lastDonationDate"
          label="Last Blood Donation Date (if any)"
        >
          <DatePicker 
            style={{ width: '100%' }}
            disabledDate={(current: any) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Divider orientation="left">Preferences & Consent</Divider>

        <Form.Item
          name="preferredDonationTime"
          label="Preferred Donation Time"
        >
          <Select>
            <Option value="morning">Morning (9 AM - 12 PM)</Option>
            <Option value="afternoon">Afternoon (12 PM - 4 PM)</Option>
            <Option value="evening">Evening (4 PM - 7 PM)</Option>
            <Option value="anytime">Anytime</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notifications"
          valuePropName="checked"
        >
          <Checkbox>I agree to receive notifications about donation campaigns and blood needs</Checkbox>
        </Form.Item>

        <Form.Item
          name="emergencyDonor"
          valuePropName="checked"
        >
          <Checkbox>I am willing to donate in emergency situations</Checkbox>
        </Form.Item>

        <Form.Item
          name="consent"
          valuePropName="checked"
          rules={[{ required: true, message: 'Please provide consent' }]}
        >
          <Checkbox>
            I consent to the collection, processing, and storage of my personal and medical information 
            for blood donation purposes
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="profilePhoto"
          label="Profile Photo (Optional)"
        >
          <Upload
            listType="picture"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Upload Photo</Button>
          </Upload>
        </Form.Item>

        <div className="flex justify-between items-center mt-6">
          {mode === 'create' && (
            <Button onClick={handleEligibilityCheck} loading={loading}>
              Check Eligibility
            </Button>
          )}
          {mode !== 'create' && <div />}
          <div className="space-x-2">
            <Button onClick={onCancel} disabled={loading}>Cancel</Button>
            {mode !== 'view' && (
              <Button type="primary" htmlType="submit" loading={loading}>
                {mode === 'edit' ? 'Update Donor' : 'Register Donor'}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  );
}
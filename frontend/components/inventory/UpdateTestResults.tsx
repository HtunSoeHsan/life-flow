'use client';

import { useState } from 'react';
import { Modal, Form, Select, Button, Row, Col, message } from 'antd';

const { Option } = Select;

interface UpdateTestResultsProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (testResults: any) => void;
  unit: any;
}

export default function UpdateTestResults({ visible, onCancel, onSubmit, unit }: UpdateTestResultsProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success('Test results updated successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to update test results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Test Results"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={unit?.testResults || {}}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hiv" label="HIV Test" rules={[{ required: true }]}>
              <Select>
                <Option value="Negative">Negative</Option>
                <Option value="Positive">Positive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hbv" label="HBV Test" rules={[{ required: true }]}>
              <Select>
                <Option value="Negative">Negative</Option>
                <Option value="Positive">Positive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hcv" label="HCV Test" rules={[{ required: true }]}>
              <Select>
                <Option value="Negative">Negative</Option>
                <Option value="Positive">Positive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="syphilis" label="Syphilis Test" rules={[{ required: true }]}>
              <Select>
                <Option value="Negative">Negative</Option>
                <Option value="Positive">Positive</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Tests
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
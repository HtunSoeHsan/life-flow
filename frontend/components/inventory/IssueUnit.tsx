'use client';

import { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface IssueUnitProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  unit: any;
}

export default function IssueUnit({ visible, onCancel, onSubmit, unit }: IssueUnitProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const issueData = {
        ...values,
        unitId: unit.id,
        issueDate: values.issueDate.toISOString(),
      };
      await onSubmit(issueData);
      message.success('Unit issued successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to issue unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Issue Blood Unit"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ issueDate: dayjs(), urgency: 'Normal' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="recipientName" 
              label="Recipient Name" 
              rules={[{ required: true, message: 'Please enter recipient name' }]}
            >
              <Input placeholder="Patient/Hospital name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="recipientId" 
              label="Recipient ID" 
              rules={[{ required: true, message: 'Please enter recipient ID' }]}
            >
              <Input placeholder="Patient ID or Hospital ID" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="issueDate" 
              label="Issue Date" 
              rules={[{ required: true, message: 'Please select issue date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="urgency" 
              label="Urgency Level" 
              rules={[{ required: true, message: 'Please select urgency' }]}
            >
              <Select>
                <Option value="Emergency">Emergency</Option>
                <Option value="Urgent">Urgent</Option>
                <Option value="Normal">Normal</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="doctorName" 
          label="Requesting Doctor" 
          rules={[{ required: true, message: 'Please enter doctor name' }]}
        >
          <Input placeholder="Doctor name" />
        </Form.Item>

        <Form.Item 
          name="indication" 
          label="Medical Indication" 
          rules={[{ required: true, message: 'Please enter medical indication' }]}
        >
          <TextArea rows={2} placeholder="Reason for blood transfusion" />
        </Form.Item>

        <Form.Item name="notes" label="Additional Notes">
          <TextArea rows={2} placeholder="Any additional notes..." />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Issue Unit
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
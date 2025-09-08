'use client';

import { useState } from 'react';
import { Modal, Form, Select, Input, Button, message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface ChangeStatusProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  unit: any;
}

export default function ChangeStatus({ visible, onCancel, onSubmit, unit }: ChangeStatusProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await onSubmit(values);
      message.success('Status updated successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Unit Status"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: unit?.status }}
      >
        <Form.Item 
          name="status" 
          label="New Status" 
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            <Option value="Available">Available</Option>
            <Option value="Reserved">Reserved</Option>
            <Option value="Issued">Issued</Option>
            <Option value="Expired">Expired</Option>
            <Option value="Quarantine">Quarantine</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes (Optional)">
          <TextArea rows={3} placeholder="Reason for status change..." />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Status
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
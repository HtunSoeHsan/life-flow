'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Option } = Select;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/hospitals');
        const data = await response.json();
        if (data.success) {
          setHospitals(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  const handleHospitalLogin = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/hospital/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('auth', JSON.stringify(data.data));
        message.success('Login successful');
        router.push('/hospital');
      } else {
        message.error(data.error || 'Login failed');
      }
    } catch (error) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      console.log('Admin login response:', data);
      
      if (response.ok && data.success) {
        localStorage.setItem('auth', JSON.stringify(data.data));
        message.success('Admin login successful');
        router.push('/admin');
      } else {
        message.error(data.error || 'Login failed');
      }
    } catch (error) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">LifeFlow Login</h1>
          <p className="text-gray-600">Blood Bank Management System</p>
        </div>

        <Tabs 
          defaultActiveKey="hospital" 
          centered
          items={[
            {
              key: 'hospital',
              label: 'Hospital Login',
              children: (
                <Form onFinish={handleHospitalLogin} layout="vertical">
                  <Form.Item
                    name="hospitalId"
                    label="Hospital ID"
                    rules={[{ required: true, message: 'Please select hospital' }]}
                  >
                    <Select placeholder="Select Hospital">
                      {hospitals.map((hospital: any) => (
                        <Option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please input username' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please input password' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      Login to Hospital
                    </Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'admin',
              label: 'Super Admin',
              children: (
                <Form onFinish={handleAdminLogin} layout="vertical">
                  <Form.Item
                    name="username"
                    label="Admin Username"
                    rules={[{ required: true, message: 'Please input admin username' }]}
                  >
                    <Input prefix={<BankOutlined />} placeholder="superadmin" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="Admin Password"
                    rules={[{ required: true, message: 'Please input admin password' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      Login as Super Admin
                    </Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
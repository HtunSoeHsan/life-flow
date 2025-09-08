'use client';

import { useState } from 'react';
import { Modal, Card, Descriptions, Tag, Button, Timeline, Progress, Avatar, Divider, Space, Statistic, Row, Col } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  HeartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface DonorProfileProps {
  visible: boolean;
  onCancel: () => void;
  donor: any;
}

export default function DonorProfile({ visible, onCancel, donor }: DonorProfileProps) {
  if (!donor) return null;

  const getDonationEligibilityStatus = () => {
    if (!donor.lastDonationDate) return { status: 'eligible', text: 'Eligible to donate', color: 'green' };
    
    const daysSinceLastDonation = dayjs().diff(dayjs(donor.lastDonationDate), 'day');
    const requiredGap = 90; // 3 months gap required
    
    if (daysSinceLastDonation >= requiredGap) {
      return { status: 'eligible', text: 'Eligible to donate', color: 'green' };
    } else {
      const remainingDays = requiredGap - daysSinceLastDonation;
      return { 
        status: 'waiting', 
        text: `Eligible in ${remainingDays} days`, 
        color: 'orange' 
      };
    }
  };

  const eligibilityStatus = getDonationEligibilityStatus();

  const donationHistory = [
    { date: '2024-01-15', type: 'Whole Blood', status: 'Completed', location: 'Main Center' },
    { date: '2023-10-20', type: 'Platelets', status: 'Completed', location: 'Mobile Camp' },
    { date: '2023-07-12', type: 'Whole Blood', status: 'Completed', location: 'Main Center' },
    { date: '2023-04-08', type: 'Whole Blood', status: 'Completed', location: 'Hospital Drive' },
  ];

  const rewardPoints = 450;
  const totalDonations = donationHistory.length;
  const nextMilestone = 500;

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{donor.firstName} {donor.lastName}</div>
            <div className="text-sm text-gray-500">Donor ID: {donor.donorId}</div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Status Cards */}
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" className="text-center">
              <Statistic
                title="Total Donations"
                value={totalDonations}
                prefix={<HeartOutlined className="text-red-500" />}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <Statistic
                title="Reward Points"
                value={rewardPoints}
                prefix={<TrophyOutlined className="text-yellow-500" />}
                valueStyle={{ color: '#eab308' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" className="text-center">
              <div className="text-sm text-gray-500 mb-1">Donation Status</div>
              <Tag 
                color={eligibilityStatus.color} 
                icon={eligibilityStatus.status === 'eligible' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                {eligibilityStatus.text}
              </Tag>
            </Card>
          </Col>
        </Row>

        {/* Progress to Next Milestone */}
        <Card size="small" title="Progress to Next Milestone">
          <div className="mb-2">
            <span className="text-sm text-gray-600">
              {rewardPoints} / {nextMilestone} points to Gold Status
            </span>
          </div>
          <Progress 
            percent={(rewardPoints / nextMilestone) * 100} 
            strokeColor="#eab308"
            showInfo={false}
          />
        </Card>

        {/* Personal Information */}
        <Card title="Personal Information" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Full Name">
              {donor.firstName} {donor.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Blood Group">
              <Tag color="red" className="font-semibold">{donor.bloodGroup}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Age">
              {donor.age} years
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {donor.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Weight">
              {donor.weight} kg
            </Descriptions.Item>
            <Descriptions.Item label="Occupation">
              {donor.occupation}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Date">
              {dayjs(donor.registrationDate).format('DD MMM YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Emergency Contact">
              {donor.emergencyContact}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information" size="small">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <PhoneOutlined className="text-blue-500" />
              <span>{donor.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MailOutlined className="text-green-500" />
              <span>{donor.email}</span>
            </div>
            <div className="flex items-start space-x-2">
              <UserOutlined className="text-gray-500 mt-1" />
              <span>{donor.address}</span>
            </div>
          </div>
        </Card>

        {/* Medical Information */}
        <Card title="Medical Information" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Chronic Diseases">
              {donor.hasChronicDisease ? (
                <div>
                  <Tag color="orange">Yes</Tag>
                  <div className="mt-1 text-sm">{donor.chronicDiseaseDetails}</div>
                </div>
              ) : (
                <Tag color="green">None</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Current Medication">
              <Tag color={donor.recentMedication ? "orange" : "green"}>
                {donor.recentMedication ? "Yes" : "No"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Last Donation">
              {donor.lastDonationDate ? 
                dayjs(donor.lastDonationDate).format('DD MMM YYYY') : 
                'First time donor'
              }
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Donation History */}
        <Card title="Donation History" size="small">
          {donationHistory.length > 0 ? (
            <Timeline
              items={donationHistory.map((donation, index) => ({
                dot: <HeartOutlined className="text-red-500" />,
                children: (
                  <div>
                    <div className="font-medium">{donation.type}</div>
                    <div className="text-sm text-gray-500">
                      {dayjs(donation.date).format('DD MMM YYYY')} • {donation.location}
                    </div>
                    <Tag color="green">{donation.status}</Tag>
                  </div>
                ),
              }))}
            />
          ) : (
            <div className="text-center text-gray-500 py-4">
              No donation history available
            </div>
          )}
        </Card>

        {/* Preferences */}
        <Card title="Preferences & Settings" size="small">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Preferred Donation Time:</span>
              <Tag>{donor.preferredDonationTime || 'Not specified'}</Tag>
            </div>
            <div className="flex justify-between">
              <span>Notifications:</span>
              <Tag color={donor.notifications ? 'green' : 'red'}>
                {donor.notifications ? 'Enabled' : 'Disabled'}
              </Tag>
            </div>
            <div className="flex justify-between">
              <span>Emergency Donor:</span>
              <Tag color={donor.emergencyDonor ? 'orange' : 'default'}>
                {donor.emergencyDonor ? 'Yes' : 'No'}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button>Edit Profile</Button>
          <Button>Send Message</Button>
          <Button type="primary" disabled={eligibilityStatus.status !== 'eligible'}>
            Schedule Donation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
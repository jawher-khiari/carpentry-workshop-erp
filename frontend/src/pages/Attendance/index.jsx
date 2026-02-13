import { useState, useEffect } from 'react';
import { Row, Col, Button, Table, Tag, Select, message, Card } from 'antd';
import { LoginOutlined, LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { ErpLayout } from '@/layout';

export default function Attendance() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkers = async () => {
    const { success, result } = await request.listAll({ entity: 'worker' });
    if (success) {
      setWorkers(result || []);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    const { success, result } = await request.listAll({ entity: 'attendance' });
    if (success) {
      setAttendanceList(result || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    if (!selectedWorker) {
      message.warning(translate('Please select a worker'));
      return;
    }
    try {
      const response = await request.post({
        entity: 'attendance/checkIn',
        jsonData: { worker: selectedWorker },
      });
      if (response.success) {
        message.success(translate('Check-in recorded successfully'));
        fetchAttendance();
      } else {
        message.error(response.message || translate('Check-in failed'));
      }
    } catch (error) {
      message.error(translate('Check-in failed'));
    }
  };

  const handleCheckOut = async () => {
    if (!selectedWorker) {
      message.warning(translate('Please select a worker'));
      return;
    }
    try {
      const response = await request.post({
        entity: 'attendance/checkOut',
        jsonData: { worker: selectedWorker },
      });
      if (response.success) {
        message.success(translate('Check-out recorded successfully'));
        fetchAttendance();
      } else {
        message.error(response.message || translate('Check-out failed'));
      }
    } catch (error) {
      message.error(translate('Check-out failed'));
    }
  };

  const columns = [
    {
      title: translate('Worker'),
      dataIndex: ['worker', 'name'],
      render: (text, record) => {
        const worker = record.worker || {};
        return `${worker.name || ''} ${worker.surname || ''}`.trim();
      },
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => (date ? dayjs(date).format(dateFormat) : '-'),
    },
    {
      title: translate('Check In'),
      dataIndex: 'checkIn',
      render: (time) => (time ? dayjs(time).format('HH:mm') : '-'),
    },
    {
      title: translate('Check Out'),
      dataIndex: 'checkOut',
      render: (time) => (time ? dayjs(time).format('HH:mm') : '-'),
    },
    {
      title: translate('Lateness (min)'),
      dataIndex: 'latenessMinutes',
      render: (val) => (val != null ? val : '-'),
    },
    {
      title: translate('Penalty Blocks'),
      dataIndex: 'penaltyBlocks',
      render: (val) => (val != null ? val : '-'),
    },
    {
      title: translate('Deduction'),
      dataIndex: 'deduction',
      render: (val) => (val != null ? Number(val).toFixed(2) : '0.00'),
    },
    {
      title: translate('Net Pay'),
      dataIndex: 'netDailyPay',
      render: (val) => (val != null ? Number(val).toFixed(2) : '0.00'),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'checked-in') color = 'green';
        else if (status === 'checked-out') color = 'blue';
        else if (status === 'absent') color = 'red';
        return <Tag color={color}>{translate(status || 'unknown')}</Tag>;
      },
    },
  ];

  return (
    <ErpLayout>
      <Card title={translate('Attendance Management')} style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Select
              placeholder={translate('Select Worker')}
              style={{ width: '100%' }}
              onChange={(value) => setSelectedWorker(value)}
              value={selectedWorker}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {workers.map((w) => (
                <Select.Option key={w._id} value={w._id}>
                  {w.name} {w.surname}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleCheckIn}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              {translate('Check In')}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleCheckOut}
            >
              {translate('Check Out')}
            </Button>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchAttendance}>
              {translate('Refresh')}
            </Button>
          </Col>
        </Row>
      </Card>
      <div className="whiteBox shadow pad20">
        <h3 style={{ color: '#22075e', marginBottom: 15 }}>
          {translate('Attendance Records')}
        </h3>
        <Table
          columns={columns}
          dataSource={attendanceList}
          rowKey={(record) => record._id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </div>
    </ErpLayout>
  );
}

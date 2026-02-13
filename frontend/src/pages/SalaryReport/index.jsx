import { useState, useEffect } from 'react';
import { Row, Col, Table, DatePicker, Card, Statistic, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { ErpLayout } from '@/layout';

export default function SalaryReport() {
  const translate = useLanguage();
  const [workers, setWorkers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [workersRes, attendanceRes] = await Promise.all([
          request.listAll({ entity: 'worker' }),
          request.listAll({ entity: 'attendance' }),
        ]);

        if (workersRes.success) setWorkers(workersRes.result || []);
        if (attendanceRes.success) setAttendanceData(attendanceRes.result || []);
      } catch (e) {
        // silently fail
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!workers.length) return;

    const month = selectedMonth.month();
    const year = selectedMonth.year();

    const monthAttendance = attendanceData.filter((a) => {
      const d = dayjs(a.date);
      return d.month() === month && d.year() === year;
    });

    const report = workers.map((worker) => {
      const workerAttendance = monthAttendance.filter(
        (a) => a.worker?._id === worker._id || a.worker === worker._id
      );

      const daysWorked = workerAttendance.filter(
        (a) => a.status === 'checked-in' || a.status === 'checked-out'
      ).length;

      const totalDeductions = workerAttendance.reduce(
        (sum, a) => sum + (a.deduction || 0),
        0
      );

      const totalLateness = workerAttendance.reduce(
        (sum, a) => sum + (a.latenessMinutes || 0),
        0
      );

      const grossPay = daysWorked * (worker.dailyWage || 0);
      const netPay = grossPay - totalDeductions;

      return {
        _id: worker._id,
        name: worker.name,
        surname: worker.surname,
        dailyWage: worker.dailyWage || 0,
        daysWorked,
        totalLateness,
        totalDeductions,
        grossPay,
        netPay,
      };
    });

    setReportData(report);
  }, [workers, attendanceData, selectedMonth]);

  const totalGross = reportData.reduce((sum, r) => sum + r.grossPay, 0);
  const totalDeductions = reportData.reduce((sum, r) => sum + r.totalDeductions, 0);
  const totalNet = reportData.reduce((sum, r) => sum + r.netPay, 0);

  const columns = [
    {
      title: translate('Worker'),
      key: 'worker',
      render: (_, record) => `${record.name} ${record.surname}`,
    },
    {
      title: translate('Daily Wage'),
      dataIndex: 'dailyWage',
      render: (val) => Number(val).toFixed(2),
    },
    {
      title: translate('Days Worked'),
      dataIndex: 'daysWorked',
    },
    {
      title: translate('Total Lateness (min)'),
      dataIndex: 'totalLateness',
      render: (val) => (
        <Tag color={val > 0 ? 'orange' : 'green'}>{val}</Tag>
      ),
    },
    {
      title: translate('Gross Pay'),
      dataIndex: 'grossPay',
      render: (val) => Number(val).toFixed(2),
    },
    {
      title: translate('Deductions'),
      dataIndex: 'totalDeductions',
      render: (val) => (
        <span style={{ color: val > 0 ? '#cf1322' : 'inherit' }}>
          -{Number(val).toFixed(2)}
        </span>
      ),
    },
    {
      title: translate('Net Pay'),
      dataIndex: 'netPay',
      render: (val) => (
        <strong>{Number(val).toFixed(2)}</strong>
      ),
    },
  ];

  return (
    <ErpLayout>
      <Card
        title={translate('Monthly Salary Report')}
        extra={
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(date) => date && setSelectedMonth(date)}
            allowClear={false}
          />
        }
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Spin spinning={loading}>
                <Statistic
                  title={translate('Total Gross Pay')}
                  value={totalGross}
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Spin spinning={loading}>
                <Statistic
                  title={translate('Total Deductions')}
                  value={totalDeductions}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Spin>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Spin spinning={loading}>
                <Statistic
                  title={translate('Total Net Pay')}
                  value={totalNet}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>
      </Card>

      <div className="whiteBox shadow pad20">
        <h3 style={{ color: '#22075e', marginBottom: 15 }}>
          {translate('Worker Salary Details')} - {selectedMonth.format('MMMM YYYY')}
        </h3>
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey={(record) => record._id}
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>{translate('Total')}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4}>
                  <strong>{totalGross.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <strong style={{ color: '#cf1322' }}>-{totalDeductions.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <strong style={{ color: '#3f8600' }}>{totalNet.toFixed(2)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </div>
    </ErpLayout>
  );
}

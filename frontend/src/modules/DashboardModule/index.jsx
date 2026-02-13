import { useEffect, useState } from 'react';

import { Tag, Row, Col, Card, Statistic, Spin } from 'antd';
import useLanguage from '@/locale/useLanguage';

import { useMoney } from '@/settings';

import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';

import RecentTable from './components/RecentTable';

import SummaryCard from './components/SummaryCard';
import PreviewCard from './components/PreviewCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';

import { selectMoneyFormat } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';

export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);

  const [expenseData, setExpenseData] = useState({ total: 0, salaries: 0, materials: 0 });
  const [expenseLoading, setExpenseLoading] = useState(true);

  const getStatsData = async ({ entity, currency }) => {
    return await request.summary({
      entity,
      options: { currency },
    });
  };

  const {
    result: invoiceResult,
    isLoading: invoiceLoading,
    onFetch: fetchInvoicesStats,
  } = useOnFetch();

  const { result: quoteResult, isLoading: quoteLoading, onFetch: fetchQuotesStats } = useOnFetch();

  const {
    result: paymentResult,
    isLoading: paymentLoading,
    onFetch: fetchPayemntsStats,
  } = useOnFetch();

  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );

  // Fetch expense data for financial reporting
  useEffect(() => {
    const fetchExpenses = async () => {
      setExpenseLoading(true);
      try {
        const res = await request.listAll({ entity: 'expense' });
        if (res.success && res.result) {
          const expenses = res.result;
          let totalExpenses = 0;
          let totalSalaries = 0;
          let totalMaterials = 0;
          expenses.forEach((exp) => {
            totalExpenses += exp.amount || 0;
            if (exp.category === 'salary') totalSalaries += exp.amount || 0;
            if (exp.category === 'material') totalMaterials += exp.amount || 0;
          });
          setExpenseData({ total: totalExpenses, salaries: totalSalaries, materials: totalMaterials });
        }
      } catch (e) {
        // silently fail
      }
      setExpenseLoading(false);
    };
    fetchExpenses();
  }, []);

  useEffect(() => {
    const currency = money_format_settings.default_currency_code || null;

    if (currency) {
      fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
      fetchQuotesStats(getStatsData({ entity: 'quote', currency }));
      fetchPayemntsStats(getStatsData({ entity: 'payment', currency }));
    }
  }, [money_format_settings.default_currency_code]);

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },

    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const entityData = [
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Invoices'),
    },
    {
      result: quoteResult,
      isLoading: quoteLoading,
      entity: 'quote',
      title: translate('quote'),
    },
  ];

  const statisticCards = entityData.map((data, index) => {
    const { result, entity, isLoading, title } = data;

    return (
      <PreviewCard
        key={index}
        title={title}
        isLoading={isLoading}
        entity={entity}
        statistics={
          !isLoading &&
          result?.performance?.map((item) => ({
            tag: item?.status,
            color: 'blue',
            value: item?.percentage,
          }))
        }
      />
    );
  });

  // Calculate net profit
  const totalIncome = paymentResult?.total || 0;
  const netProfit = totalIncome - expenseData.total;

  if (money_format_settings) {
    return (
      <>
        <Row gutter={[32, 32]}>
          <SummaryCard
            title={translate('Weekly Income')}
            prefix={translate('This week')}
            isLoading={invoiceLoading}
            data={invoiceResult?.total}
          />
          <SummaryCard
            title={translate('Monthly Income')}
            prefix={translate('This month')}
            isLoading={paymentLoading}
            data={paymentResult?.total}
          />
          <SummaryCard
            title={translate('paid')}
            prefix={translate('This month')}
            isLoading={paymentLoading}
            data={paymentResult?.total}
          />
          <SummaryCard
            title={translate('Unpaid')}
            prefix={translate('Not Paid')}
            isLoading={invoiceLoading}
            data={invoiceResult?.total_undue}
          />
        </Row>
        <div className="space30"></div>

        {/* Financial Summary Section */}
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 8 }}>
            <Card>
              <Spin spinning={expenseLoading}>
                <Statistic
                  title={translate('Total Expenses')}
                  value={expenseData.total}
                  precision={2}
                  suffix="TND"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Spin>
            </Card>
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 8 }}>
            <Card>
              <Spin spinning={expenseLoading}>
                <Statistic
                  title={translate('Total Salaries')}
                  value={expenseData.salaries}
                  precision={2}
                  suffix="TND"
                  valueStyle={{ color: '#faad14' }}
                />
              </Spin>
            </Card>
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 8 }}>
            <Card>
              <Spin spinning={expenseLoading || paymentLoading}>
                <Statistic
                  title={translate('Net Profit')}
                  value={netProfit}
                  precision={2}
                  suffix="TND"
                  valueStyle={{ color: netProfit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>
        <div className="space30"></div>

        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 18 }}>
            <div className="whiteBox shadow" style={{ height: 458 }}>
              <Row className="pad20" gutter={[0, 0]}>
                {statisticCards}
              </Row>
            </div>
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 6 }}>
            <CustomerPreviewCard
              isLoading={clientLoading}
              activeCustomer={clientResult?.active}
              newCustomer={clientResult?.new}
            />
          </Col>
        </Row>
        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Invoices')}
              </h3>

              <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
            </div>
          </Col>

          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Quotes')}
              </h3>
              <RecentTable entity={'quote'} dataTableColumns={dataTableColumns} />
            </div>
          </Col>
        </Row>
      </>
    );
  } else {
    return <></>;
  }
}

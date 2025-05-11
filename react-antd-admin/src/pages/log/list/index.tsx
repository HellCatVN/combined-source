import { LoadingOutlined } from '@ant-design/icons';
import { Card, Space, Table, TableColumnsType, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import queryString from 'query-string';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useGetLogs } from '@hooks/react-query/useLog';
import useModalNotify from '@hooks/useModalNotify';
import type { ILog } from '@interfaces';
import { getError } from '@utils';

const LogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setErrorModalNotify, ModalComponent } = useModalNotify();

  const size = Number(searchParams.get('size')) || 10;
  const index = Number(searchParams.get('index')) || 1;
  const { isLoading, data, error } = useGetLogs({
    size,
    index,
  });

  const columns: TableColumnsType<ILog> = [
    {
      title: 'Username',
      key: 'userActionId',
      dataIndex: 'userActionId',
      render: (value: ILog['userActionId']) => <Typography.Text>{value.username}</Typography.Text>,
    },
    {
      title: 'Record',
      key: 'record',
      dataIndex: 'record',
    },
    {
      title: 'Schema',
      key: 'schema',
      dataIndex: 'schema',
    },
    {
      title: 'Note',
      key: 'note',
      dataIndex: 'note',
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
      render: (value: ILog['action']) => {
        let color = '';
        switch (value) {
          case 'create':
            color = 'green';
            break;
          case 'update':
            color = 'blue';
            break;
          case 'delete':
            color = 'red';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: 'Updated At',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      render: (value: ILog['updatedAt']) => (
        <Typography.Text>{dayjs(value).format('DD-MM-YYYY')}</Typography.Text>
      ),
    },
  ];

  const handleOnChangePage = (page: number, pageSize: number) => {
    const params = queryString.stringify({
      index: page,
      size: pageSize,
    });
    setSearchParams(params);
  };

  useEffect(() => {
    if (error) {
      setErrorModalNotify({
        title: 'Error',
        text: getError(error),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div>
      <ModalComponent />
      <Card title="Nhật ký">
        <Space direction="vertical" size="middle" className="w-100">
          {/* <Row justify="end" gutter={[16, 16]}>
            <Col >
              <Form.Item label="Filter by date">
                <DatePicker.RangePicker format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row> */}
          {/* TODO: UPDATE API FOR FILTER BY DATE */}
          <Table
            columns={columns}
            loading={{
              spinning: isLoading,
              indicator: <LoadingOutlined spin />,
            }}
            rowKey={record => `${record.record}-${record.updatedAt}`}
            dataSource={data?.data || []}
            pagination={{
              pageSize: size,
              current: index,
              onChange: handleOnChangePage,
              total: data?.pagination.total,
            }}
            scroll={{ x: 'max-content' }}
            sticky={{
              offsetHeader: 0,
            }}
            size="small"
          />
        </Space>
      </Card>
    </div>
  );
};

export default LogList;

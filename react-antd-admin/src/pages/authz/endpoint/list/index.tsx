import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Space, Table, TableColumnsType, Tag } from 'antd';
import queryString from 'query-string';
import { Link, useSearchParams } from 'react-router-dom';

import backendSearchFilterBuilder from '@components/table/backendSearchFilterBuilder';
import { useGetEndpointPermissions, useDeleteEndpointPermission } from '@hooks/react-query/useAuthz';
import { EndpointPermission } from '@interfaces/authz';
import { getError } from '@utils';
import { useRef } from 'react';
import type { InputRef } from 'antd';

const methodColors: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  PATCH: 'purple'
};

const EndpointPermissionList = () => {
  const { modal, notification } = App.useApp();
  const { mutate: executeDeleteEndpoint } = useDeleteEndpointPermission();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || undefined;
  const size = Number(searchParams.get('size')) || 10;
  const index = Number(searchParams.get('index')) || 1;

  const searchDropdownInput = useRef<InputRef>(null!);

  const { data: response, isLoading, refetch } = useGetEndpointPermissions({
    path,
    size,
    index,
  });

  const data = response?.data;

  const handleDeleteEndpoint = (id: string) => {
    executeDeleteEndpoint(id, {
      onSuccess: (response: any) => {
        notification.success({
          message: 'Successfully',
          description: response.data.message,
          placement: 'topRight',
        });
        refetch();
      },
      onError: error => {
        notification.error({
          message: 'Error!',
          description: getError(error),
          placement: 'topRight',
        });
      },
    });
  };

  const handleOnChangePage = (page: number, pageSize: number) => {
    const params = queryString.stringify({
      path,
      index: page,
      size: pageSize,
    });
    setSearchParams(params);
  };

  const handleOnChangeFilter = (fieldName: string, value: string) => {
    const params = queryString.stringify({
      path,
      size,
      index: 1,
      [fieldName]: value,
    });
    setSearchParams(params);
  };

  const columns: TableColumnsType<EndpointPermission> = [
    {
      title: 'Path',
      key: 'path',
      dataIndex: 'path',
      sorter: {
        compare: (a, b) => a.path.localeCompare(b.path),
      },
      ...backendSearchFilterBuilder('path', searchDropdownInput, handleOnChangeFilter),
    },
    {
      title: 'Method',
      key: 'method',
      dataIndex: 'method',
      render: method => (
        <Tag color={methodColors[method]}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Resource',
      key: 'resource',
      dataIndex: 'resource',
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'action',
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: value => (
        <Tag color={value ? 'success' : 'error'}>
          {value ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<DeleteOutlined />}
            type="text"
            onClick={() =>
              modal.confirm({
                centered: true,
                title: 'Confirm',
                content: `Are you sure to delete endpoint ${record.path} (${record.method})?`,
                onOk: () => handleDeleteEndpoint(record._id),
              })
            }
          />
          <Link to={`/authz/endpoint/edit/${record._id}`}>
            <Button icon={<EditOutlined />} type="text" />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Endpoint Permission List">
      <Space direction="vertical" size="middle" className="w-100">
        <Row justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Link to="/authz/endpoint/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Endpoint
              </Button>
            </Link>
          </Col>
          <Col xs={24} md={16}>
            <Input.Search
              className="w-100"
              defaultValue={path}
              placeholder="Search endpoint by path"
              onSearch={value => handleOnChangeFilter('path', value)}
            />
          </Col>
        </Row>

        <Table<EndpointPermission>
          columns={columns}
          loading={{
            spinning: isLoading,
            indicator: <LoadingOutlined spin />,
          }}
          dataSource={data?.data || []}
          pagination={{
            pageSize: size,
            current: index,
            onChange: handleOnChangePage,
            total: data?.pagination?.total || 0,
          }}
          rowKey={({ _id }) => _id}
          scroll={{ x: 'max-content' }}
          sticky={{
            offsetHeader: 0,
          }}
          size="small"
        />
      </Space>
    </Card>
  );
};

export default EndpointPermissionList;
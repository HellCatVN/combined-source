import { DeleteOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Space, Table, TableColumnsType, Tag } from 'antd';
import queryString from 'query-string';
import { Link, useSearchParams } from 'react-router-dom';

import backendSearchFilterBuilder from '@components/table/backendSearchFilterBuilder';
import { useGetResources, useDeleteResource } from '@hooks/react-query/useAuthz';
import { Resource } from '@interfaces/authz';
import { getError } from '@utils';
import { useRef } from 'react';
import type { InputRef } from 'antd';

const ResourceList = () => {
  const { modal, notification } = App.useApp();
  const { mutate: executeDeleteResource } = useDeleteResource();
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name') || undefined;
  const size = Number(searchParams.get('size')) || 10;
  const index = Number(searchParams.get('index')) || 1;

  const searchDropdownInput = useRef<InputRef>(null!);

  const { data: response, isLoading, refetch } = useGetResources({
    name,
    size,
    index,
  });

  const data = response?.data;

  const handleDeleteResource = (id: string) => {
    executeDeleteResource(id, {
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
      name,
      index: page,
      size: pageSize,
    });
    setSearchParams(params);
  };

  const handleOnChangeFilter = (fieldName: string, value: string) => {
    const params = queryString.stringify({
      name,
      size,
      index: 1,
      [fieldName]: value,
    });
    setSearchParams(params);
  };

  const columns: TableColumnsType<Resource> = [
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
      ...backendSearchFilterBuilder('name', searchDropdownInput, handleOnChangeFilter),
    },
    {
      title: 'Allowed Actions',
      key: 'allowedActions',
      dataIndex: 'allowedActions',
      render: (actions: string[]) => (
        <Space size={[0, 4]} wrap>
          {actions.map(action => (
            <Tag key={action} color="blue">
              {action}
            </Tag>
          ))}
        </Space>
      ),
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
      key: 'action',
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
                content: `Are you sure to delete resource ${record.name}?`,
                onOk: () => handleDeleteResource(record._id),
              })
            }
          />
          <Link to={`/authz/resource/edit/${record._id}`}>
            <Button icon={<EditOutlined />} type="text" />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Resource List">
      <Space direction="vertical" size="middle" className="w-100">
        <Row justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space>
              <Link to="/authz/resource/create">
                <Button type="primary" size="large">
                  Create Resource
                </Button>
              </Link>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Input.Search
              size="large"
              className="w-100"
              defaultValue={name}
              placeholder="Search resource by name"
              onSearch={value => handleOnChangeFilter('name', value)}
            />
          </Col>
        </Row>

        <Table<Resource>
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
            total: data?.pagination?.total,
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

export default ResourceList;
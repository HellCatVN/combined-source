import { useNavigate } from 'react-router-dom';
import { Button, Card, Space, Table, Tag, Tooltip, App } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { CreateEndpointPermissionPayload, EndpointPermission } from '@interfaces/authz';
import { useGetEndpointPermissions, useDeleteEndpointPermission } from '@hooks/react-query/useAuthz';
import { IPaginationSuccessResponse } from '@interfaces/response';

interface TableEndpointPermission extends EndpointPermission {
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

const EndpointList = () => {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  
  const { data: response, isLoading } = useGetEndpointPermissions({});
  
  // Safely access nested response data with proper type checking
  const endpointData = response?.data?.data ?? [];
  const paginationData = response?.data?.pagination;
  const deleteEndpoint = useDeleteEndpointPermission();
  
  const handleDelete = (id: string) => {
    modal.confirm({
      title: 'Delete Endpoint',
      content: 'Are you sure you want to delete this endpoint configuration?',
      onOk: () => deleteEndpoint.mutate(id),
    });
  };

  const columns: ColumnsType<TableEndpointPermission> = [
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
      render: (path: string) => <Tag>{path}</Tag>,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 90,
      responsive: ['xs'],
      render: (method: string) => (
        <Tag color={
          method === 'GET' ? 'green' :
          method === 'POST' ? 'blue' :
          method === 'PUT' ? 'orange' :
          method === 'DELETE' ? 'red' :
          method === 'PATCH' ? 'purple' : 'default'
        }>
          {method}
        </Tag>
      ),
    },
    {
      title: 'Auth Type',
      dataIndex: 'authType',
      key: 'authType',
      width: 90,
      responsive: ['sm'],
      render: (authType: string) => (
        <Tag color={authType === 'all' ? 'blue' : 'orange'}>
          {authType}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      responsive: ['md'],
      ellipsis: true,
      render: (_, record: TableEndpointPermission) => (
        <Space size={[0, 4]} wrap>
          {record.permissions.map((p, i) => (
            <Tooltip key={i} title={`Resource: ${p.resource}, Action: ${p.action}`}>
              <Tag color="processing">{p.resource}:{p.action}</Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      responsive: ['lg'],
      ellipsis: true,
      render: (description: string) => description || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/authz/endpoint/edit/${record._id}`)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Endpoint Permissions"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/authz/endpoint/create')}
        >
          {window.innerWidth > 576 ? 'Add Endpoint' : ''}
        </Button>
      }
    >
      <Table<TableEndpointPermission>
        columns={columns}
        dataSource={endpointData as TableEndpointPermission[]}
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: 800 }}
        pagination={
          paginationData
            ? {
                current: paginationData.current_page,
                pageSize: paginationData.limit,
                total: paginationData.total,
                showTotal: (total) => `Total ${total} items`,
              }
            : false
        }
      />
    </Card>
  );
};

export default EndpointList;
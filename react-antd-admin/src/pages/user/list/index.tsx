import { DeleteOutlined, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Input,
  InputRef,
  Row,
  Select,
  Space,
  Switch,
  Table,
  TableColumnsType,
} from 'antd';
import queryString from 'query-string';
import { Link, useSearchParams } from 'react-router-dom';

import backendSearchFilterBuilder from '@components/table/backendSearchFilterBuilder';
import { USER_STATUS } from '@constants';
import { useDeleteUser, useGetUsers } from '@hooks/react-query/useUsers';
import { IClientUser } from '@interfaces';
import { getError } from '@utils';
import { useRef } from 'react';

const UserList = () => {
  const { modal, notification } = App.useApp();
  const { mutate: executeDeleteUser } = useDeleteUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name') || undefined;
  const role = searchParams.get('role') || undefined;
  const status = searchParams.get('status') || undefined;
  const size = Number(searchParams.get('size')) || 10;
  const index = Number(searchParams.get('index')) || 1;

  const searchDropdownInput = useRef<InputRef>(null!);

  const { data, isLoading, refetch } = useGetUsers({
    name,
    role,
    size,
    status,
    index,
  });

  const handleDeleteUser = (username: string) => {
    executeDeleteUser(username, {
      onSuccess: (response: any) => {
        notification.success({
          message: 'Successfully',
          description: response.message,
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
      role,
      status,
      index: page,
      size: pageSize,
    });
    setSearchParams(params);
  };

  const handleOnChangeFilter = (fieldName: string, value: string) => {
    const params = queryString.stringify({
      name,
      size,
      role,
      status,
      index: 1,
      [fieldName]: value,
    });
    setSearchParams(params);
  };

  const columns: TableColumnsType<IClientUser> = [
    {
      title: 'Username',
      key: 'username',
      dataIndex: 'username',
      sorter: {
        compare: (a, b) => a.username.localeCompare(b.username),
      },
      ...backendSearchFilterBuilder('username', searchDropdownInput, handleOnChangeFilter),
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
      render: value => {
        return <p>{value.name}</p>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      dataIndex: 'status',
      sorter: {
        compare: (a, b) => a.name.localeCompare(b.name),
      },
      render: value => {
        return <Switch checked={value === 'active'} disabled />;
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 140,
      render: (_, record) => {
        return (
          <Space size="middle">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              onClick={() =>
                modal.confirm({
                  centered: true,
                  title: 'Confirm',
                  content: `Are you sure to delete user ${record.username} ?`,
                  onOk: () => handleDeleteUser(record.username),
                })
              }
            />
            <Link to={`/admin/users/edit/${record.username}`}>
              <Button icon={<EditOutlined />} type="text" />
            </Link>
          </Space>
        );
      },
    },
  ];

  return (
    <Card title="Danh sách người dùng">
      <Space direction="vertical" size="middle" className="w-100">
        <Row justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input.Search
              size="large"
              className="w-100"
              defaultValue={name}
              placeholder="Search user by name"
              onSearch={value => handleOnChangeFilter('name', value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Row justify="end" gutter={[16, 16]}>
              <Col xs={12} md={12} lg={10} xl={8}>
                {/* TODO: Should be select from backend */}
                {/* <Select
                  allowClear
                  size="large"
                  className="w-100"
                  defaultValue={role}
                  title="Select Role"
                  placeholder="Select role"
                  style={{ textTransform: 'capitalize' }}
                  dropdownStyle={{ textTransform: 'capitalize' }}
                  options={Object.values(USER_ROLES).map(role => ({
                    label: role,
                    value: role,
                  }))}
                  onChange={value => handleOnChangeFilter('role', value)}
                /> */}
              </Col>
              <Col xs={12} md={12} lg={10} xl={8}>
                <Select
                  allowClear
                  size="large"
                  className="w-100"
                  defaultValue={status}
                  title="Select status"
                  placeholder="Select status"
                  style={{ textTransform: 'capitalize' }}
                  dropdownStyle={{ textTransform: 'capitalize' }}
                  options={Object.values(USER_STATUS).map(status => ({
                    label: status,
                    value: status,
                  }))}
                  onChange={value => handleOnChangeFilter('status', value)}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Table
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
            total: data?.pagination.total,
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

export default UserList;

import { App, Button, Card, Col, Form, Input, Row, Select, Space, Switch } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { USER_STATUS } from '@constants';
import { useGetUser, useUpdateUser } from '@hooks/react-query/useUsers';
import useForm from '@hooks/useForm';
import { getError } from '@utils';
import { validatorResponseUpdateUser } from '@validations/index';
import { validatorUpdateUser } from '@validations/schemas/user';
import type { IEditUserForm } from 'interfaces';

const DEFAULT_VALUES: Partial<IEditUserForm> = {};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const EditUser = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data } = useGetUser(id);
  const { notification, modal } = App.useApp();
  const { mutate: executeUpdateUser } = useUpdateUser();

  const { formField, inputField } = useForm<Partial<IEditUserForm>>({
    form: form,
    schema: validatorUpdateUser,
    onSubmit: (formData, error) => {
      if (error) return;
      modal.confirm({
        centered: true,
        title: 'Edit user',
        content: `Are you sure to edit user ${data?.data.username} ?`,
        onOk: () => handleOnSubmit(formData as IEditUserForm),
      });
    },
  });
  const status = Form.useWatch('status', formField.form);

  const columns = [
    {
      title: 'Balance',
      dataIndex: 'balance',
      render: () => (
        <Form.Item {...inputField} label="Balance" name="balance">
          <Input size="large" placeholder="Enter balance" />
        </Form.Item>
      ),
    },
  ];

  function handleOnSubmit(formData: IEditUserForm) {
    if (!data?.data.username)
      return notification.error({
        message: 'Error!',
        description: 'User information invalid!',
      });
    executeUpdateUser(
      {
        username: data?.data.username,
        payload: formData,
      },
      {
        onSuccess: async (response: any) => {
          try {
            await validatorResponseUpdateUser.parseAsync(response);
            notification.success({
              message: 'Success',
              description: response.message,
            });
          } catch (error) {
            notification.error({
              message: 'Error',
              description: getError(error),
            });
          }
        },
        onError: error => {
          notification.error({
            message: 'Error',
            description: getError(error),
          });
        },
      }
    );
  }

  function handleOnReset() {
    if (data && data.data) {
      formField.form.setFieldsValue(data.data);
    }
  }

  useEffect(() => {
    if (data?.data) {
      formField.form.setFieldsValue(data.data);
    }
  }, [data?.data, formField.form]);

  return (
    <Card>
      <Row>
        <Col xs={24} md={18}>
          <Form
            {...formField}
            {...formItemLayout}
            layout="horizontal"
            clearOnDestroy={true}
            scrollToFirstError={true}
            initialValues={DEFAULT_VALUES}
          >
            <Form.Item {...inputField} label="Username" name="username">
              <Input readOnly disabled size="large" />
            </Form.Item>

            <Form.Item {...inputField} label="Name" name="name">
              <Input readOnly disabled size="large" />
            </Form.Item>

            <Form.Item {...inputField} label="Email" name="email">
              <Input size="large" placeholder="Enter email" />
            </Form.Item>

            <Form.Item {...inputField} label="Phone" name="phone">
              <Input size="large" placeholder="Enter phone" />
            </Form.Item>

            {columns.map(column => column.render())}

            {/* <Form.Item {...inputField} label="Role" name="role">
              <Select
                size="large"
                style={{ textTransform: 'capitalize' }}
                dropdownStyle={{ textTransform: 'capitalize' }}
                options={Object.values(USER_ROLES).map(role => ({
                  label: role,
                  value: role,
                }))}
              />
            </Form.Item> */}

            <Form.Item {...inputField} name="status" label="User status" layout="horizontal">
              <Switch
                checked={status === USER_STATUS.active}
                checkedChildren="Active"
                unCheckedChildren="Lock"
                onChange={checked => {
                  if (checked) {
                    return formField.form.setFieldValue('status', USER_STATUS.active);
                  }
                  return formField.form.setFieldValue('status', USER_STATUS.lock);
                }}
              />
            </Form.Item>

            <Row justify="end">
              <Col>
                <Space>
                  <Button danger type="primary" disabled={!data?.data} onClick={handleOnReset}>
                    Reset
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Save changes
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default EditUser;

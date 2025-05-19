import { App, Button, Card, Col, Form, Input, Row, Space, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateRole, useGetResources } from '@hooks/react-query/useAuthz';
import useForm from '@hooks/useForm';
import { CreateRolePayload } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorUpdateRole, validatorResponseUpdateRole } from '@validations/schemas/authz';

const DEFAULT_VALUES: Partial<CreateRolePayload> = {
  name: '',
  description: '',
  permissions: [],
};

const CreateRole = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();
  const { mutate: executeCreateRole } = useCreateRole();
  const { data: resourcesResponse } = useGetResources({});
  const [selectedResource, setSelectedResource] = useState<string>('');

  const { formField, inputField } = useForm<Partial<CreateRolePayload>>({
    form: form,
    schema: validatorUpdateRole,
    onSubmit: (formData, error) => {
      if (error) return;
      modal.confirm({
        centered: true,
        title: 'Create role',
        content: `Are you sure to create role ${formData?.name || ''}?`,
        onOk: () => handleOnSubmit(formData as CreateRolePayload),
      });
    },
  });

  const handleOnSubmit = (formData: CreateRolePayload) => {
    executeCreateRole(
      formData,
      {
        onSuccess: async response => {
          try {
            await validatorResponseUpdateRole.parseAsync(response.data);
            notification.success({
              message: 'Success',
              description: response.data.message,
            });
            navigate('/authz/role/list');
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
  };

  return (
    <Card>
      <Row>
        <Col xs={24} md={18}>
          <Form
            {...formField}
            layout="vertical"
            initialValues={DEFAULT_VALUES}
          >
            <Form.Item {...inputField} label="Name" name="name">
              <Input size="large" placeholder="Enter role name" />
            </Form.Item>

            <Form.Item {...inputField} label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Enter role description" />
            </Form.Item>

            <Form.Item label="Permissions">
              <Form.List name="permissions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} style={{ marginBottom: 16 }} size="small">
                      <Row gutter={16}>
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            label="Resource"
                            name={[name, 'resource']}
                            rules={[{ required: true, message: 'Resource is required' }]}
                          >
                            <Select
                              placeholder="Select resource"
                              onChange={(value) => setSelectedResource(value)}
                              options={resourcesResponse?.data.data.map((resource) => ({
                                label: resource.name,
                                value: resource.name
                              }))}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            label="Action"
                            name={[name, 'action']}
                            rules={[{ required: true, message: 'Action is required' }]}
                          >
                            <Select
                              placeholder="Select action"
                              options={resourcesResponse?.data.data
                                .find(r => r.name === selectedResource)
                                ?.allowedActions.map(action => ({
                                  label: action,
                                  value: action
                                })) || []
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ textAlign: 'center', alignSelf: 'center' }}>
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Permission
                    </Button>
                  </Form.Item>
                </>
              )}
              </Form.List>
            </Form.Item>

            <Row justify="end">
              <Col>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Create
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

export default CreateRole;
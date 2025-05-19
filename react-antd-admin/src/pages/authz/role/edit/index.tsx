import { App, Button, Card, Col, Form, Input, Row, Space, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useGetRole, useUpdateRole, useGetResources } from '@hooks/react-query/useAuthz';
import useForm from '@hooks/useForm';
import { UpdateRolePayload } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorUpdateRole, validatorResponseUpdateRole } from '@validations/schemas/authz';

const DEFAULT_VALUES: Partial<UpdateRolePayload> = {
  name: '',
  description: '',
  permissions: [],
};

const EditRole = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data: response } = useGetRole(id);
  const { notification, modal } = App.useApp();
  const { mutate: executeUpdateRole } = useUpdateRole();
  const { data: resourcesResponse } = useGetResources({});
  const [selectedResource, setSelectedResource] = useState<string>('');

  const { formField, inputField } = useForm<Partial<UpdateRolePayload>>({
    form: form,
    schema: validatorUpdateRole,
    onSubmit: (formData, error) => {
      if (error) return;
      modal.confirm({
        centered: true,
        title: 'Edit role',
        content: `Are you sure to edit role ${response?.data.data.name}?`,
        onOk: () => handleOnSubmit(formData as UpdateRolePayload),
      });
    },
  });

  const handleOnSubmit = (formData: UpdateRolePayload) => {
    if (!id)
      return notification.error({
        message: 'Error!',
        description: 'Role ID invalid!',
      });
    executeUpdateRole(
      {
        id,
        payload: formData,
      },
      {
        onSuccess: async response => {
          try {
            await validatorResponseUpdateRole.parseAsync(response.data);
            notification.success({
              message: 'Success',
              description: response.data.message,
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
  };

  function handleOnReset() {
    if (response?.data.data) {
      formField.form.setFieldsValue(response.data.data);
    }
  }

  useEffect(() => {
    if (response?.data.data) {
      formField.form.setFieldsValue(response.data.data);
    }
  }, [response?.data.data, formField.form]);

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
                  <Button danger type="primary" disabled={!response?.data.data} onClick={handleOnReset}>
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

export default EditRole;
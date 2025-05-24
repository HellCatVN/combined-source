import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateEndpointPermissionPayload } from '@interfaces/authz';
import { useCreateEndpointPermission, useGetResources } from '@hooks/react-query/useAuthz';
import useForm from '@hooks/useForm';
import { z } from 'zod';

const { Option } = Select;

const schema = z.object({
  path: z.string().min(1, 'Path is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  authType: z.enum(['any', 'all']),
  permissions: z.array(z.object({
    resource: z.string().min(1, 'Resource is required'),
    action: z.string().min(1, 'Action is required')
  })).min(1, 'At least one permission is required'),
  description: z.string().optional(),
  isActive: z.boolean()
}) satisfies z.ZodType<CreateEndpointPermissionPayload>;

type FormData = z.infer<typeof schema>;

const DEFAULT_VALUES: FormData = {
  path: '',
  method: 'GET',
  authType: 'all',
  permissions: [{ resource: '', action: '' }],
  description: '',
  isActive: true,
};

const EndpointCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const createEndpoint = useCreateEndpointPermission();
  const { data: resourcesResponse } = useGetResources({});
  const [selectedResources, setSelectedResources] = useState<Record<number, string>>({});

  const { formField, inputField } = useForm<FormData>({
    form,
    schema,
    onSubmit: (formData, error) => {
      if (error || !formData) return;
      modal.confirm({
        title: 'Create Endpoint',
        content: 'Are you sure you want to create this endpoint configuration?',
        onOk: () => {
          createEndpoint.mutate(formData, {
            onSuccess: () => navigate('/authz/endpoint/list'),
          });
        },
      });
    },
  });

  return (
    <Card title="Create Endpoint Permission">
      <Row>
        <Col xs={24} md={18}>
          <Form
            {...formField}
            layout="vertical"
            initialValues={DEFAULT_VALUES}
          >
            <Form.Item {...inputField} label="Path" name="path" required>
              <Input placeholder="Enter endpoint path (e.g., /api/users)" />
            </Form.Item>

            <Form.Item {...inputField} label="Method" name="method" required>
              <Select>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="PATCH">PATCH</Option>
              </Select>
            </Form.Item>

            <Form.Item {...inputField} label="Auth Type" name="authType" required>
              <Select>
                <Option value="all">All (Must have all permissions)</Option>
                <Option value="any">Any (Must have any permission)</Option>
              </Select>
            </Form.Item>

            <Form.List name="permissions">
              {(fields, { add, remove }) => (
                <Form.Item label="Permissions" required>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} style={{ marginBottom: 16 }} size="small">
                      <Row gutter={16}>
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            name={[name, 'resource']}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[{ required: true, message: 'Resource is required' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="Select resource"
                              onChange={(value) => {
                                setSelectedResources(prev => ({
                                  ...prev,
                                  [name]: value
                                }));
                              }}
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
                            name={[name, 'action']}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[{ required: true, message: 'Action is required' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select
                              placeholder="Select action"
                              options={resourcesResponse?.data.data
                                .find(r => r.name === selectedResources[name])
                                ?.allowedActions.map(action => ({
                                  label: action,
                                  value: action
                                })) || []
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ textAlign: 'right' }}>
                          {fields.length > 1 && (
                            <MinusCircleOutlined 
                              onClick={() => remove(name)}
                              style={{ color: '#ff4d4f', cursor: 'pointer' }}
                            />
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Permission
                  </Button>
                </Form.Item>
              )}
            </Form.List>

            <Form.Item {...inputField} label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Enter description" />
            </Form.Item>

            <Form.Item {...inputField} label="Status" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Row justify="end">
              <Col>
                <Space>
                  <Button onClick={() => navigate('/authz/endpoint/list')}>
                    Cancel
                  </Button>
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

export default EndpointCreate;
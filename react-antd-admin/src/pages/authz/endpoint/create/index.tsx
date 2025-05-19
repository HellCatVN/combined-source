import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Select } from 'antd';

import { useGetResources, useCreateEndpointPermission } from '@hooks/react-query/useAuthz';
import useForm from '@hooks/useForm';
import { CreateEndpointPermissionPayload } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorCreateEndpointPermission, validatorResponseUpdateEndpointPermission as validatorResponseCreateEndpointPermission } from '@validations/schemas/authz';

const DEFAULT_VALUES: Partial<CreateEndpointPermissionPayload> = {
  path: '',
  method: 'GET',
  resource: '',
  action: '',
  description: '',
  isActive: true
};

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

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const CreateEndpointPermission = () => {
  const [form] = Form.useForm();
  const { data: resourcesResponse } = useGetResources({});
  const { notification, modal } = App.useApp();
  const selectedResourceName = Form.useWatch('resource', form);
  const { mutate: executeCreateEndpoint } = useCreateEndpointPermission();

  const { formField, inputField } = useForm<Partial<CreateEndpointPermissionPayload>>({
    form: form,
    schema: validatorCreateEndpointPermission,
    onSubmit: (formData, error) => {
      if (error) return;
      modal.confirm({
        centered: true,
        title: 'Create endpoint permission',
        content: `Are you sure to create endpoint ${formData?.path || ''}?`,
        onOk: () => handleOnSubmit(formData as CreateEndpointPermissionPayload),
      });
    },
  });

  const handleOnSubmit = (formData: CreateEndpointPermissionPayload) => {
    executeCreateEndpoint(
      formData,
      {
        onSuccess: async response => {
          try {
            await validatorResponseCreateEndpointPermission.parseAsync(response.data);
            notification.success({
              message: 'Success',
              description: response.data.message,
            });
            form.resetFields();
            window.location.href = '/authz/endpoint/list';
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

  const resources = resourcesResponse?.data.data || [];
  const selectedResource = resources.find(r => r.name === selectedResourceName);

  return (
    <Card title="Create Endpoint Permission">
      <Row>
        <Col xs={24} md={18}>
          <Form
            {...formField}
            {...formItemLayout}
            layout="horizontal"
            initialValues={DEFAULT_VALUES}
          >
            <Form.Item {...inputField} label="Path" name="path">
              <Input size="large" placeholder="Enter endpoint path (e.g. /api/users)" />
            </Form.Item>

            <Form.Item {...inputField} label="HTTP Method" name="method">
              <Select
                size="large"
                placeholder="Select HTTP method"
                options={HTTP_METHODS.map(method => ({
                  label: method,
                  value: method,
                }))}
              />
            </Form.Item>

            <Form.Item {...inputField} label="Resource" name="resource">
              <Select
                size="large"
                placeholder="Select resource"
                options={resources.map(resource => ({
                  label: resource.name,
                  value: resource.name,
                }))}
              />
            </Form.Item>

            <Form.Item {...inputField} label="Action" name="action">
              <Select
                size="large"
                placeholder="Select action"
                disabled={!selectedResource}
                options={selectedResource?.allowedActions.map(action => ({
                  label: action,
                  value: action,
                })) || []}
              />
            </Form.Item>

            <Form.Item {...inputField} label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Enter endpoint description" />
            </Form.Item>

            <Form.Item {...inputField} label="Status" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Row justify="end">
              <Col>
                <Space>
                  <Button danger type="primary" onClick={() => form.resetFields()}>
                    Reset
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

export default CreateEndpointPermission;
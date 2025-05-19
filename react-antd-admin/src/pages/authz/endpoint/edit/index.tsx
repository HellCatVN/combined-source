import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Select } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  useGetEndpointPermission,
  useUpdateEndpointPermission,
  useGetResources
} from '@hooks/react-query/useAuthz';
import useForm from '@hooks/useForm';
import { UpdateEndpointPermissionPayload, Resource } from '@interfaces/authz';
import { getError } from '@utils';
import { validatorUpdateEndpointPermission, validatorResponseUpdateEndpointPermission } from '@validations/schemas/authz';

const DEFAULT_VALUES: Partial<UpdateEndpointPermissionPayload> = {
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

const EditEndpointPermission = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data: response } = useGetEndpointPermission(id);
  const { data: resourcesResponse } = useGetResources({});
  const { notification, modal } = App.useApp();
  const { mutate: executeUpdateEndpoint } = useUpdateEndpointPermission();

  const { formField, inputField } = useForm<Partial<UpdateEndpointPermissionPayload>>({
    form: form,
    schema: validatorUpdateEndpointPermission,
    onSubmit: (formData, error) => {
      if (error) return;
      modal.confirm({
        centered: true,
        title: 'Edit endpoint permission',
        content: `Are you sure to edit endpoint ${response?.data.data.path}?`,
        onOk: () => handleOnSubmit(formData as UpdateEndpointPermissionPayload),
      });
    },
  });

  const handleOnSubmit = (formData: UpdateEndpointPermissionPayload) => {
    if (!id)
      return notification.error({
        message: 'Error!',
        description: 'Endpoint Permission ID invalid!',
      });
    executeUpdateEndpoint(
      {
        id,
        payload: formData,
      },
      {
        onSuccess: async response => {
          try {
            await validatorResponseUpdateEndpointPermission.parseAsync(response.data);
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

  const resources = resourcesResponse?.data.data || [];
  const selectedResource = resources.find(r => r.name === form.getFieldValue('resource'));

  return (
    <Card>
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

export default EditEndpointPermission;
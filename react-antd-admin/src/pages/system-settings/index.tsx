import { App, Button, Card, Col, Form, Input, Row, Space } from 'antd';
import { useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';

import { fetchSystemSettings, updateSystemSettings } from '@api/system-settings';
import { getError } from '@utils';
import { IEditSystemSettingsForm } from 'interfaces/systemSettings.interface';

const DEFAULT_VALUES: Partial<IEditSystemSettingsForm> = {
  message: '',
};

const SystemSettings = () => {
  const [form] = Form.useForm();
  const { notification, modal } = App.useApp();

  const { data, refetch } = useQuery({
    queryKey: 'systemSettings',
    queryFn: ({ signal }) => fetchSystemSettings(signal),
    onError: error => {
      notification.error({
        message: 'Error',
        description: getError(error),
      });
    },
  });

  const mutation = useMutation(updateSystemSettings, {
    onSuccess: response => {
      notification.success({
        message: 'Success',
        description: response.message,
      });
      refetch();
    },
    onError: error => {
      notification.error({
        message: 'Error',
        description: getError(error),
      });
    },
  });

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data.data);
    }
  }, [data, form]);

  const handleOnSubmit = (formData: IEditSystemSettingsForm) => {
    modal.confirm({
      centered: true,
      title: 'Edit System Settings',
      content: `Are you sure to edit system setting message '${formData.message}'?`,
      onOk: () => mutation.mutate(formData),
    });
  };

  const handleOnReset = () => {
    if (data && data.data) {
      form.setFieldsValue(data.data);
    }
  };

  return (
    <>
      <Card title="System Settings">
        <Row>
          <Col xs={24} md={18}>
            <Form
              form={form}
              layout="horizontal"
              initialValues={DEFAULT_VALUES}
              onFinish={handleOnSubmit}
            >
              <Form.Item
                label="Message"
                name="message"
                rules={[{ required: true, message: 'Please enter a message' }]}
              >
                <Input size="large" placeholder="Enter message" />
              </Form.Item>

              <Row justify="end">
                <Col>
                  <Space>
                    <Button danger type="primary" onClick={handleOnReset}>
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
    </>
  );
};

export default SystemSettings;

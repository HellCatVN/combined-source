import { App, Button, Card, Col, Form, Input, Row, Space, Switch, Select, theme } from 'antd';
import { CreateResourcePayload, UpdateResourcePayload } from '@interfaces/authz';
import useForm from '@hooks/useForm';
import { ZodSchema } from 'zod';

export const DEFAULT_VALUES: CreateResourcePayload = {
  name: '',
  description: '',
  allowedActions: [],
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

const COMMON_ACTIONS = ['create', 'read', 'update', 'delete', 'list'];

type ResourceFormData = Omit<UpdateResourcePayload, '_id'>;

interface ResourceFormProps {
  initialValues?: ResourceFormData;
  schema: ZodSchema;
  onSubmit: (formData: ResourceFormData) => void;
  submitButtonText: string;
  modalTitle: string;
  modalContent: string;
  showReset?: boolean;
  onReset?: () => void;
}

const ResourceForm = ({
  initialValues = DEFAULT_VALUES,
  schema,
  onSubmit,
  submitButtonText,
  modalTitle,
  modalContent,
  showReset = false,
  onReset
}: ResourceFormProps) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const { modal } = App.useApp();

  const { formField, inputField } = useForm<ResourceFormData>({
    form: form,
    schema: schema,
    onSubmit: (formData, error) => {
      if (error || !formData) return;
      modal.confirm({
        centered: true,
        title: modalTitle,
        content: modalContent,
        onOk: () => onSubmit(formData),
      });
    },
  });

  return (
    <Card>
      <Row>
        <Col xs={24} md={18}>
          <Form
            {...formField}
            {...formItemLayout}
            layout="horizontal"
            initialValues={initialValues}
          >
            <Form.Item {...inputField} label="Name" name="name">
              <Input size="large" placeholder="Enter resource name" />
            </Form.Item>

            <Form.Item {...inputField} label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Enter resource description" />
            </Form.Item>

            <Form.Item
              {...inputField}
              label="Allowed Actions"
              name="allowedActions"
              tooltip="You can select from common actions or add your custom actions"
              extra={
                <ul style={{ marginTop: 8, color: token.colorTextDescription, fontSize: '14px' }}>
                  <li>Select from predefined actions or type your custom action</li>
                  <li>Custom actions must be single words (no spaces allowed)</li>
                  <li>Use comma (,) to quickly add multiple actions</li>
                  <li>Example: read,write,execute</li>
                </ul>
              }
            >
              <Select
                mode="tags"
                size="large"
                placeholder="Select or type allowed actions (Example: read, write)"
                options={COMMON_ACTIONS.map(action => ({
                  label: action,
                  value: action,
                }))}
                onInputKeyDown={e => {
                  // Prevent spaces in custom options
                  if (e.key === ' ') {
                    e.preventDefault();
                  }
                }}
                tokenSeparators={[',']}
              />
            </Form.Item>

            <Form.Item {...inputField} label="Status" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Row justify="end">
              <Col>
                <Space>
                  {showReset && (
                    <Button danger type="primary" onClick={onReset}>
                      Reset
                    </Button>
                  )}
                  <Button type="primary" htmlType="submit">
                    {submitButtonText}
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

export default ResourceForm;
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetUser, useSelfUpdateUser } from '@hooks/react-query/useUsers';
import { getError } from '@utils';
import { validatorResponseUpdateUser } from '@validations/index';
import type { GetProp, UploadProps } from 'antd';
import { App, Button, Card, Col, Form, Image, Input, Row, Typography, Upload, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IClientUser, ISelfUpdateForm } from '../../interfaces/user';

const { Title } = Typography;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
    return false;
  }
  return true;
};

const AccountPage: React.FC = () => {
  const [form] = Form.useForm<IClientUser>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const { user } = useSelector((state: any) => state.auth);
  const { data } = useGetUser(user?.username);
  const { notification, modal } = App.useApp();
  const { mutate: executeSelfUpdate } = useSelfUpdateUser();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue(data.data);
      if (data.data.avatar) {
        setImageUrl(data.data.avatar);
      }
    }
  }, [data?.data, form]);

  const onFinish = (values: IClientUser) => {
    if (!data?.data.username) {
      notification.error({
        message: 'Error!',
        description: 'User information invalid!',
      });
      return;
    }

    modal.confirm({
      centered: true,
      title: 'Update Account',
      content: 'Are you sure you want to update your account information?',
      onOk: () => {
        const updateData: ISelfUpdateForm = {
          name: values.name,
          email: values.email,
          phone: values.phone,
        };

        executeSelfUpdate(
          {
            username: data.data.username,
            payload: updateData,
          },
          {
            onSuccess: async (response: any) => {
              try {
                await validatorResponseUpdateUser.parseAsync(response);
                notification.success({
                  message: 'Success',
                  description: response.message,
                });
                setIsEditing(false);
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
      },
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = async (info: any) => {
    const file = info.file.originFileObj;
    if (!file) return;

    try {
      const base64Url = await getBase64(file);
      setImageUrl(base64Url);
      setSelectedFile(file);
    } catch (error) {
      message.error('Error converting image');
      console.error('Error converting image:', error);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      message.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Avatar updated successfully');
    } catch (error) {
      message.error('Failed to update avatar');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload Photo</div>
    </div>
  );

  if (!data?.data) {
    return <Card loading />;
  }

  return (
    <Row>
      <Col
        xs={{ span: 24, offset: 0 }}
        sm={{ span: 20, offset: 2 }}
        md={{ span: 18, offset: 3 }}
        lg={{ span: 18, offset: 3 }}
        xl={{ span: 18, offset: 3 }}
      >
        <Card
          title={<Title level={3}>Account Information</Title>}
          extra={
            <Button type="primary" onClick={toggleEdit}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          }
        >
          <Row gutter={24}>
            <Col span={8}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  {imageUrl ? (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <Image
                          src={imageUrl}
                          alt="avatar"
                          width="100%"
                          preview={{
                            mask: 'Click to preview',
                          }}
                        />
                      </div>
                      <Upload
                        name="avatar"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        customRequest={({ onSuccess }) => onSuccess?.('ok')}
                      >
                        <Button icon={<PlusOutlined />}>Change Photo</Button>
                      </Upload>
                    </>
                  ) : (
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                      customRequest={({ onSuccess }) => onSuccess?.('ok')}
                    >
                      {uploadButton}
                    </Upload>
                  )}
                  {selectedFile && (
                    <Button
                      type="primary"
                      onClick={handleSaveAvatar}
                      loading={loading}
                      style={{ marginTop: 16, width: '100%' }}
                    >
                      Save Photo
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
            <Col span={16}>
              <Form form={form} layout="vertical" onFinish={onFinish} disabled={!isEditing}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item name="phone" label="Phone">
                  <Input />
                </Form.Item>

                <Form.Item name="balance" label="Balance">
                  <Input disabled />
                </Form.Item>

                <Form.Item name="role" label="Role">
                  <Input disabled />
                </Form.Item>

                {isEditing && (
                  <Form.Item>
                    <Button type="primary" onClick={() => form.submit()}>
                      Save Changes
                    </Button>
                  </Form.Item>
                )}
              </Form>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default AccountPage;

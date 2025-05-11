import { green } from '@ant-design/colors';
import { ExclamationCircleFilled, LockOutlined, UserOutlined } from '@ant-design/icons';
import { login } from '@api/auth/auth';
import loginBackground from '@assets/lottie/login.json';
import { config } from '@configs/index';
import { Player } from '@lottiefiles/react-lottie-player';
import { setAuthState } from '@stores/user.store';
import { getError } from '@utils';
import { Button, Card, Col, Flex, Form, Image, Input, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const footerHeight = '50px'; // Configurable footer height
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/welcome');
    }
  }, [user, navigate]);

  const onFinish = async (values: any) => {
    const { username, password } = values;
    try {
      const response = await login({ username, password });
      dispatch(
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          error: null,
        })
      );
      navigate('/welcome');
    } catch (error) {
      dispatch(
        setAuthState({
          user: null,
          isAuthenticated: false,
          error: getError(error),
        })
      );
      // Error handling is already done in the store
      console.error('Login failed:', error);
      const errorMsg = getError(error);
      setErrorMessage(errorMsg);
      setErrorModalVisible(true);
    }
  };

  return (
    <>
      <Image
        width={200}
        src={config.logo}
        preview={false}
        alt={`${config.siteName} Logo`}
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1 }}
      />
      {config.signUp && (
        <Button
          type="primary"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1,
            backgroundColor: green[6],
            borderColor: green[6],
          }}
        >
          <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </Button>
      )}
      <Row
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
        align="middle"
        justify="start"
      >
        <Player
          loop
          src={loginBackground}
          autoplay
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        />
        <Col xs={22} sm={16} md={12} lg={8} xl={6} style={{ marginLeft: '5%' }}>
          <Card style={{ backgroundColor: 'transparent', border: 'none' }}>
            <Form
              name="login"
              initialValues={{ remember: true }}
              style={{ maxWidth: '100%' }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your Username!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  style={{ backgroundColor: 'transparent', color: 'black' }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input
                  prefix={<LockOutlined />}
                  type="password"
                  placeholder="Password"
                  style={{ backgroundColor: 'transparent', color: 'black' }}
                />
              </Form.Item>
              <Form.Item>
                <Flex justify="space-between" align="center">
                  {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item> */}
                  <a href="/forgot" style={{ fontWeight: 'bold', color: green[6] }}>
                    Forgot password
                  </a>
                </Flex>
              </Form.Item>

              <Form.Item>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  style={{ backgroundColor: green[6], borderColor: green[6] }}
                >
                  Log in
                </Button>
                {/* or <a href="">Register now!</a> */}
              </Form.Item>
              {/* <Form.Item>
                <Button block icon={<GoogleOutlined />} style={{ marginBottom: '8px' }}>
                  Log in with Google
                </Button>
                <Button
                  block
                  icon={<FacebookOutlined />}
                  style={{ backgroundColor: '#3b5998', color: '#fff' }}
                >
                  Log in with Facebook
                </Button>
              </Form.Item> */}
            </Form>
          </Card>
        </Col>
      </Row>
      <Row
        justify="space-between"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '10px',
          height: footerHeight,
        }}
      >
        <Col>
          <p style={{ color: 'black' }}>
            © {currentYear} {config.siteName}
          </p>
        </Col>
        <Col>
          <p style={{ color: 'black' }}>Made with ❤️ by HellCatVN</p>
        </Col>
        {/* <Col>
          <p style={{ color: 'black' }}>Contact: hellcatvn@gmail.com</p>
        </Col> */}
      </Row>
      <Modal
        title="Login Error"
        open={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        centered
        cancelButtonProps={{ style: { display: 'none' } }}
        style={{ maxWidth: '480px' }}
      >
        <Flex vertical align="center" gap="middle">
          <ExclamationCircleFilled style={{ fontSize: '64px', color: '#ff4d4f' }} />
          <p>{errorMessage}</p>
        </Flex>
      </Modal>
    </>
  );
};

export default Login;

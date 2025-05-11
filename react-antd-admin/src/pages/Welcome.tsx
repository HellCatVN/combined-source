import welcomeUser from '@assets/card/welcome-user.png'; // Adjust the path to your image
import { Card, Col, Row, Typography } from 'antd';
import { useSelector } from 'react-redux';

export default function Welcome() {
  const { user } = useSelector((state: any) => state.auth);

  return (
    <>
      <Card>
        <div>
          <Row gutter={24} align="middle">
            <Col xs={24} md={16}>
              <Typography.Title level={1}>
                Welcome <span> {user.username} !</span> 🎉
              </Typography.Title>
              <div>
                <Typography.Text>Great to see you again. Let's make today awesome!</Typography.Text>
              </div>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <img
                alt="Upgrade Account"
                src={welcomeUser}
                style={{
                  width: '100%',
                }}
              />
            </Col>
          </Row>
        </div>
      </Card>
    </>
  );
}

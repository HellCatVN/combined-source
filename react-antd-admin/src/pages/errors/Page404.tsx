import { Button, Result } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './errors.css';

export default function Page404() {
  const { theme } = useSelector((state: any) => state.global);
  const navigate = useNavigate();

  const themeStyles =
    theme === 'dark'
      ? {
          color: '#ffffff',
          backgroundColor: '#141414',
        }
      : {
          color: '#000000',
          backgroundColor: '#ffffff',
        };

  return (
    <div className="center-screen" style={themeStyles}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Back Home
          </Button>
        }
      />
    </div>
  );
}

import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Space, Typography } from 'antd';

interface ILoadingModal {
  isLoading: boolean;
}

const LoadingModal = ({ isLoading }: ILoadingModal) => {
  return (
    <Modal open={isLoading} footer={false} closable={false} centered>
      <Space size="middle">
        <LoadingOutlined style={{ fontSize: 28 }} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          Processing ...
        </Typography.Title>
      </Space>
    </Modal>
  );
};

export default LoadingModal;

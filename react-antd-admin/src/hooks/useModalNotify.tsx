import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useState } from 'react';

interface IModalState {
  title: string;
  text: string;
  callback?: () => void;
}

const DEFAULT_MODAL_NOTIFY: IModalState = {
  title: '',
  text: '',
  callback: undefined,
};

const useModalNotify = () => {
  const [modalState, setModalState] = useState<IModalState>(DEFAULT_MODAL_NOTIFY);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'error' | 'success'>('success');

  const showModal = (type: 'error' | 'success', state: IModalState) => {
    setModalType(type);
    setModalState(state);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    modalState.callback?.();
    setIsModalVisible(false);
  };

  const setErrorModalNotify = (state: IModalState) => {
    showModal('error', state);
  };

  const setSuccessModalNotify = (state: IModalState) => {
    showModal('success', state);
  };

  const ModalComponent = () => (
    <Modal
      centered
      open={isModalVisible}
      title={
        <div style={{ textAlign: 'center', fontSize: '2em' }}>
          {modalType === 'error' ? (
            <ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} />
          ) : (
            <CheckCircleOutlined style={{ color: 'green', marginRight: 8 }} />
          )}
          {modalState.title}
        </div>
      }
      onCancel={() => setIsModalVisible(false)}
      footer={[
        <Button key="ok" type="primary" onClick={handleOk}>
          OK
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center' }}>{modalState.text}</div>
    </Modal>
  );

  return {
    setErrorModalNotify,
    setSuccessModalNotify,
    ModalComponent,
  };
};

export default useModalNotify;

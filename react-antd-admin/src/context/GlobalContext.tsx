import { App } from 'antd';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const getGlobalContext = () => {
  const device = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP';
  const collapsed = device !== 'DESKTOP';

  return {
    device,
    collapsed,
  } as const;
};

interface IGlobalContextValues {
  device: 'MOBILE' | 'DESKTOP';
  collapsed: boolean;
  locale: string;
  updateCollapsed: (value: boolean) => void;
  updateUserLayout: (device: 'MOBILE' | 'DESKTOP', collapsed: boolean) => void;
  updateLocale: (value: string) => void;
  updateMenuList: (menuList: any) => void;
  menuList: any;
}

const defaultProvider: IGlobalContextValues = {
  ...getGlobalContext(),
  locale: 'en',
  menuList: [],
  updateCollapsed: () => null,
  updateUserLayout: () => null,
  updateLocale: () => null,
  updateMenuList: () => null,
};

const GlobalContext = createContext(defaultProvider);

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notification } = App.useApp();
  const [userLayout, setUserLayout] = useState({
    collapsed: defaultProvider.collapsed,
    device: defaultProvider.device,
  });
  const [locale, setLocale] = useState(defaultProvider.locale);
  const [menuList, setMenuList] = useState<any>([]);

  const type = searchParams.get('type');
  const message = searchParams.get('message');
  const returnUrl = searchParams.get('returnUrl');

  const updateCollapsed = (value: boolean) => {
    setUserLayout(prev => ({ ...prev, collapsed: value }));
  };

  const updateUserLayout = (device: 'MOBILE' | 'DESKTOP', collapsed: boolean) => {
    setUserLayout({ device, collapsed });
  };

  const updateLocale = (value: string) => {
    setLocale(value);
  };

  const updateMenuList = (menuList: any) => {
    setMenuList(menuList);
  };

  const detectNotification = () => {
    if (!message) return '';
    switch (type) {
      case 'error':
        notification.error({
          message,
          placement: 'topRight',
        });
        break;
      case 'warning':
        notification.warning({
          message,
          placement: 'topRight',
        });
        break;
      case 'info':
      default:
        notification.info({
          message,
          placement: 'topRight',
        });
        break;
    }
  };

  useEffect(() => {
    detectNotification();
    // eslint-disable-next-line
  }, [message, type]);

  useEffect(() => {
    if (returnUrl) {
      navigate(returnUrl);
    }
  }, [returnUrl, navigate]);

  const values: IGlobalContextValues = {
    device: userLayout.device,
    collapsed: userLayout.collapsed,
    menuList,
    locale,
    updateCollapsed,
    updateUserLayout,
    updateLocale,
    updateMenuList,
  };

  return (
    <App>
      <GlobalContext.Provider value={values}>{children}</GlobalContext.Provider>
    </App>
  );
};

export { GlobalContext, GlobalProvider };

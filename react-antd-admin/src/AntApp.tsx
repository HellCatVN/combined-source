import { useGlobal } from '@hooks/useGlobalContext';
import { setGlobalState } from '@stores/global.store';
import { App, ConfigProvider, Spin, theme as antdTheme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import './styles/styles.css';

const AntApp = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();

  const { locale } = useGlobal();

  const { theme, requests } = useSelector((state: any) => state.global);

  /** initial theme */
  useEffect(() => {
    const setTheme = (dark = true) => {
      dispatch(
        setGlobalState({
          theme: dark ? 'dark' : 'light',
        })
      );
    };

    setTheme(theme === 'dark');

    // watch system theme change
    if (!localStorage.getItem('theme')) {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');

      const matchMode = (e: MediaQueryListEvent) => {
        setTheme(e.matches);
      };

      mql.addEventListener('change', matchMode);
    }
  }, [theme, dispatch]);

  /**
   * handler function that passes locale
   * information to ConfigProvider for
   * setting language across text components
   * TODO: Change language here;
   */
  const getAntdLocale = () => {
    if (locale === 'en') {
      return enUS;
    }
  };

  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return (
    <App>
      <ConfigProvider
        locale={getAntdLocale()}
        componentSize="middle"
        theme={{
          token: {},
          algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <Spin
          spinning={Boolean(requests.length)}
          className="app-loading-wrapper"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.44)' : 'rgba(255, 255, 255, 0.44)',
          }}
          tip={'Loading...'}
          fullscreen
        ></Spin>
        {children}
      </ConfigProvider>
    </App>
  );
};

export default AntApp;

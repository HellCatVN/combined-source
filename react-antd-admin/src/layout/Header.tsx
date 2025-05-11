import type { FC } from 'react';

import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { theme as antTheme, Dropdown, Layout, MenuProps, Tooltip } from 'antd';
import { createElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logout } from '@api/auth/auth';
import Avator from '@assets/header/avator.jpeg';
import EnUsSvg from '@assets/header/en_US.svg';
import LanguageSvg from '@assets/header/language.svg';
import MoonSvg from '@assets/header/moon.svg';
import SunSvg from '@assets/header/sun.svg';
import logo from '@assets/logo/logo.png';
import { useGlobal } from '@hooks/useGlobalContext';
import { setGlobalState } from '@stores/global.store';
import { setAuthState } from '@stores/user.store';
import { useTranslation } from 'react-i18next';

// import HeaderNoticeComponent from './notice';

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  toggle: () => void;
}

const HeaderComponent: FC<HeaderProps> = ({ collapsed, toggle }) => {
  const { t } = useTranslation();
  const { locale, device, updateLocale } = useGlobal();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { theme } = useSelector((state: any) => state.global);
  const navigate = useNavigate();
  const token = antTheme.useToken();
  const dispatch = useDispatch();

  const onClickMenu: MenuProps['onClick'] = async ({ key }) => {
    switch (key) {
      case 'userInfo':
        navigate('/account-details');
        return;
      case 'userSetting':
        return;
      case 'logout':
        await logout();
        dispatch(
          setAuthState({
            user: null,
            isAuthenticated: false,
            error: null,
          })
        );
        navigate('/login');
        return;
    }
  };

  const toLogin = () => {
    navigate('/login');
  };

  const selectLocale = ({ key }: { key: any }) => {
    updateLocale(key);
    localStorage.setItem('locale', key);
  };

  const onChangeTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    localStorage.setItem('theme', newTheme);
    dispatch(
      setGlobalState({
        theme: newTheme,
      })
    );
  };

  const onClickLogo = () => {
    navigate('/');
  };

  return (
    <Header
      className="layout-page-header bg-2"
      style={{ backgroundColor: token.token.colorBgContainer }}
    >
      {device !== 'MOBILE' && (
        <div className="logo" style={{ width: collapsed ? 80 : 200 }}>
          <img
            src={logo}
            alt=""
            onClick={onClickLogo}
            style={{
              marginRight: collapsed ? '2px' : '20px',
              marginLeft: collapsed ? '2px' : '20px',
              cursor: 'pointer',
            }}
          />
        </div>
      )}
      <div className="layout-page-header-main">
        <div onClick={toggle}>
          <span id="sidebar-trigger">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
        </div>
        <div className="actions">
          <Tooltip title={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}>
            <span>
              {createElement(theme === 'dark' ? SunSvg : MoonSvg, {
                onClick: onChangeTheme,
              })}
            </span>
          </Tooltip>
          {/* <HeaderNoticeComponent /> */}
          <Dropdown
            menu={{
              onClick: info => selectLocale(info),
              items: [
                {
                  key: 'en',
                  icon: <EnUsSvg />,
                  disabled: locale === 'en',
                  label: 'English',
                },
              ],
            }}
          >
            <span>
              <LanguageSvg id="language-change" />
            </span>
          </Dropdown>

          {isAuthenticated ? (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'userInfo',
                    icon: <UserOutlined />,
                    label: <span>Account Details</span>,
                  },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: <span>{t('logout')}</span>,
                  },
                ],
                onClick: onClickMenu,
              }}
            >
              <span className="user-action">
                <img src={Avator} className="user-avator" alt="avator" />
              </span>
            </Dropdown>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={toLogin}>
              Login
            </span>
          )}
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;

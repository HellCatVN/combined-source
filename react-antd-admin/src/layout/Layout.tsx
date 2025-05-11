import { initAuth } from '@api/auth/auth';
import { config } from '@configs';
import { getGlobalContext } from '@context/GlobalContext';
import { useGlobal } from '@hooks/useGlobalContext';
import { setAuthState } from '@stores/user.store';
import { getError, getParentPath } from '@utils';
import { ConfigProvider, Drawer, Layout, theme as antTheme } from 'antd';
import { MenuList } from 'interfaces/menu';
import { Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import HeaderComponent from './Header';
import MenuComponent, { getMenuList } from './Menu';
import './index.css';
import TabsView from './tabView';

const { Sider, Content, Footer } = Layout;
const WIDTH = 992;

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openKey, setOpenkey] = useState<string>();
  const [selectedKey, setSelectedKey] = useState<string>(location.pathname);
  const [menuList, setMenuList] = useState<MenuList>([]);
  const { device, collapsed, updateCollapsed, updateUserLayout, updateMenuList } = useGlobal();
  const { user, isAuthenticated, error } = useSelector((state: any) => state.auth);
  const { theme } = useSelector((state: any) => state.global);

  const token = antTheme.useToken();

  const isMobile = device === 'MOBILE';

  useEffect(() => {
    const code = getParentPath(location.pathname);
    setOpenkey(code);
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  const toggle = () => {
    updateCollapsed(!collapsed);
  };

  useEffect(() => {
    const fecthInitAuth = async () => {
      try {
        const response = await initAuth();
        dispatch(
          setAuthState({
            user: response.data.user,
            isAuthenticated: true,
          })
        );
      } catch (error: any) {
        dispatch(
          setAuthState({
            user: null,
            isAuthenticated: false,
            error: getError(error),
          })
        );
        navigate('/login');
      }
    };
    fecthInitAuth();
  }, [dispatch, navigate]);

  useEffect(() => {
    const fetchLogout = async () => {
      dispatch(
        setAuthState({
          user: null,
          isAuthenticated: false,
          error: null,
        })
      );
      navigate('/login');
    };
    if (!isAuthenticated && error != null) {
      fetchLogout();
    }
  }, [isAuthenticated, dispatch, error, navigate]);

  useEffect(() => {
    if (user) {
      const menu = getMenuList(user?.role || 'user');
      setMenuList(menu);
      updateMenuList(menu);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    window.onresize = () => {
      const { device } = getGlobalContext();
      const rect = document.body.getBoundingClientRect();
      const needCollapse = rect.width < WIDTH;

      updateUserLayout(device, needCollapse);
    };
  }, [updateUserLayout]);

  const footerStyles =
    theme === 'dark'
      ? {
          background: '#141414',
          color: '#ffffff',
        }
      : {
          background: '#ffffff',
          color: '#000000',
        };

  return (
    <ConfigProvider theme={{}}>
      <div
        style={{
          height: '100vh',
        }}
      >
        {user && (
          <Layout className="layout-page">
            <HeaderComponent collapsed={collapsed} toggle={toggle} />
            <Layout>
              {!isMobile ? (
                <Sider
                  className="layout-page-sider"
                  trigger={null}
                  collapsible
                  style={{ backgroundColor: token.token.colorBgContainer }}
                  collapsedWidth={isMobile ? 0 : 80}
                  collapsed={collapsed}
                  breakpoint="md"
                >
                  <MenuComponent
                    menuList={menuList}
                    openKey={openKey}
                    onChangeOpenKey={k => setOpenkey(k)}
                    selectedKey={selectedKey}
                    onChangeSelectedKey={k => setSelectedKey(k)}
                  />
                </Sider>
              ) : (
                <Drawer
                  width="200"
                  placement="left"
                  styles={{
                    body: { padding: 0, height: '100%' },
                  }}
                  closable={false}
                  onClose={toggle}
                  open={!collapsed}
                >
                  <MenuComponent
                    menuList={menuList}
                    openKey={openKey}
                    onChangeOpenKey={k => setOpenkey(k)}
                    selectedKey={selectedKey}
                    onChangeSelectedKey={k => setSelectedKey(k)}
                  />
                </Drawer>
              )}
              <Content className="layout-page-content" style={{ overflow: 'auto' }}>
                {config.tabViews && <TabsView />}
                <Suspense fallback={null}>
                  <div style={{ margin: '10px' }}>
                    <Outlet />
                  </div>
                </Suspense>
              </Content>
            </Layout>
            <Footer
              style={{
                ...footerStyles,
                textAlign: 'center',
                position: 'sticky',
                bottom: 0,
                width: '100%',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p>
                Made with <span className="animated-heart">❤️</span> by HellCatVN
              </p>
            </Footer>
          </Layout>
        )}
      </div>
    </ConfigProvider>
  );
}

import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

import { GlobalProvider } from '@context/GlobalContext';
import Welcome from '@pages/Welcome';
import Page404 from '@pages/errors/Page404';
import Login from '@pages/login';
import SystemSettings from '@pages/system-settings';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import AntApp from './AntApp';
import Layout from './layout/Layout';
import i18n from './locales';
import store from './stores';

const UserList = lazy(() => import('@pages/user/list'));
const EditUser = lazy(() => import('@pages/user/edit'));
const LogList = lazy(() => import('@pages/log/list'));
const AccountPage = lazy(() => import('@pages/account'));
const PluginList = lazy(() => import('@pages/plugins/list'));

const queryClient = new QueryClient();

function App() {
  return (
    <div>
      <Provider store={store}>
        <I18nextProvider i18n={i18n} defaultNS={'translation'}>
          <AntApp>
            <QueryClientProvider client={queryClient}>
              <GlobalProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route
                      path="account-details"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <AccountPage />
                        </Suspense>
                      }
                    />

                    <Route
                      path="admin/users/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <UserList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="admin/users/edit/:id"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <EditUser />
                        </Suspense>
                      }
                    />
                    <Route
                      path="admin/logs/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <LogList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="admin/system-settings/constants"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <SystemSettings />
                        </Suspense>
                      }
                    />
                    <Route
                      path="plugins/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <PluginList />
                        </Suspense>
                      }
                    />
                    <Route path="/welcome" element={<Welcome />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<Page404 />} />
                </Routes>
              </GlobalProvider>
            </QueryClientProvider>
          </AntApp>
        </I18nextProvider>
      </Provider>
    </div>
  );
}

export default App;

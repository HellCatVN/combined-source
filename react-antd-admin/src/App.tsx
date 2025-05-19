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

// RBAC Pages
const RoleList = lazy(() => import('@pages/authz/role/list'));
const RoleEdit = lazy(() => import('@pages/authz/role/edit'));
const RoleCreate = lazy(() => import('@pages/authz/role/create'));
const ResourceList = lazy(() => import('@pages/authz/resource/list'));
const ResourceEdit = lazy(() => import('@pages/authz/resource/edit'));
const ResourceCreate = lazy(() => import('@pages/authz/resource/create'));
const EndpointList = lazy(() => import('@pages/authz/endpoint/list'));
const EndpointEdit = lazy(() => import('@pages/authz/endpoint/edit'));
const EndpointCreate = lazy(() => import('@pages/authz/endpoint/create'));

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

                    {/* RBAC Routes */}
                    <Route
                      path="authz/role/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <RoleList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/role/edit/:id"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <RoleEdit />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/role/create"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <RoleCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/resource/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <ResourceList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/resource/edit/:id"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <ResourceEdit />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/resource/create"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <ResourceCreate />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/endpoint/list"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <EndpointList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/endpoint/edit/:id"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <EndpointEdit />
                        </Suspense>
                      }
                    />
                    <Route
                      path="authz/endpoint/create"
                      element={
                        <Suspense fallback={<Skeleton />}>
                          <EndpointCreate />
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

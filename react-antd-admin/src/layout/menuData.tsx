import {
  CompassOutlined,
  FileDoneOutlined,
  FileOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
  UsbFilled,
  LockOutlined
} from '@ant-design/icons';
import { customMenuData } from '@bm/configs';

const menuData = {
  routes: [
    {
      path: '/welcome',
      name: 'Welcome',
      subject: 'dashboard',
      action: 'read',
      icon: <CompassOutlined />,
    },
    {
      path: '/admin/users',
      name: 'User',
      icon: <UserOutlined />,
      subject: 'users',
      action: 'read',
      children: [
        {
          path: '/admin/users/list',
          name: 'User List',
          icon: <UnorderedListOutlined />,
          subject: 'users',
          action: 'list',
        },
      ],
    },
    {
      path: '/plugins',
      name: 'Source Control',
      icon: <AppstoreOutlined />,
      subject: 'plugins',
      action: 'read',
      children: [
        {
          path: '/plugins/list',
          name: 'Source List',
          icon: <UnorderedListOutlined />,
          subject: 'plugins',
          action: 'list',
        },
      ],
    },
    {
      path: '/authz',
      name: 'Authorization',
      icon: <LockOutlined />,
      subject: 'authz',
      action: 'read',
      children: [
        {
          path: '/authz/role/list',
          name: 'Roles',
          icon: <UnorderedListOutlined />,
          subject: 'role',
          action: 'list',
        },
        {
          path: '/authz/resource/list',
          name: 'Resources',
          icon: <UnorderedListOutlined />,
          subject: 'resource',
          action: 'list',
        },
        {
          path: '/authz/endpoint/list',
          name: 'Endpoints',
          icon: <UnorderedListOutlined />,
          subject: 'endpoint',
          action: 'list',
        },
      ],
    },
    ...customMenuData,
    {
      path: '/admin/logs',
      name: 'Logs',
      icon: <FileDoneOutlined />,
      subject: 'logs',
      action: 'read',
      children: [
        {
          path: '/admin/logs/list',
          name: 'Log List',
          icon: <FileOutlined />,
          subject: 'logs',
          action: 'list',
        },
      ],
    },
    {
      path: '/admin/system-settings',
      name: 'System Settings',
      icon: <SettingOutlined />,
      subject: 'settings',
      action: 'read',
      children: [
        {
          path: '/admin/system-settings/constants',
          name: 'Constants Settings',
          icon: <UsbFilled />,
          subject: 'settings',
          action: 'update',
        },
      ],
    },
  ],
};

export default menuData;

import {
  CompassOutlined,
  FileDoneOutlined,
  FileOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
  UsbFilled
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

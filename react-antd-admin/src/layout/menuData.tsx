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
      roles: ['admin', 'moderator', 'censor', 'user'],
      icon: <CompassOutlined />,
    },
    {
      path: '/admin/users',
      name: 'User',
      icon: <UserOutlined />,
      roles: ['admin', 'moderator'],
      children: [
        {
          path: '/admin/users/list',
          name: 'User List',
          icon: <UnorderedListOutlined />,
        },
      ],
    },
    {
      path: '/plugins',
      name: 'Source Control',
      icon: <AppstoreOutlined />,
      roles: ['admin'],
      children: [
        {
          path: '/plugins/list',
          name: 'Source List',
          icon: <UnorderedListOutlined />,
        },
      ],
    },
    ...customMenuData,
    {
      path: '/admin/logs',
      name: 'Logs',
      icon: <FileDoneOutlined />,
      roles: ['admin', 'moderator'],
      children: [
        {
          path: '/admin/logs/list',
          name: 'Log List',
          icon: <FileOutlined />,
        },
      ],
    },
    {
      path: '/admin/system-settings',
      name: 'System Settings',
      icon: <SettingOutlined />,
      roles: ['admin'],
      children: [
        {
          path: '/admin/system-settings/constants',
          name: 'Constants Settings',
          icon: <UsbFilled />,
        },
      ],
    },
  ],
};

export default menuData;

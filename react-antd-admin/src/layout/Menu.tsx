import { MenuDataItem, MenuList } from 'interfaces/menu';
import type { FC } from 'react';

import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useGlobal } from '@hooks/useGlobalContext';
import menuData from './menuData';

export const getMenuList = (role: string) => {
  const routes = menuData.routes;
  const newMenu = loopRoutes(routes, role);
  return newMenu;
};

function getMenuItemFromRole(menuItemData: MenuDataItem, userRole: string, parentRoles?: string[]) {
  // Check if item has roles or inherit from parent
  const itemRoles = menuItemData.roles || parentRoles;

  if (itemRoles) {
    if (itemRoles.includes(userRole)) {
      // If menu item has no explicit roles, inherit from parent
      if (!menuItemData.roles && parentRoles) {
        return {
          ...menuItemData,
          roles: parentRoles,
        };
      }
      return menuItemData;
    }
    return;
  } else {
    // No roles specified at all, allow access
    return menuItemData;
  }
}

function loopRoutes(routes: any, userRole: string, parentRoles?: string[]) {
  return routes
    .map((route: MenuDataItem) => {
      const newMenu = getMenuItemFromRole(route, userRole, parentRoles);
      if (newMenu) {
        if (newMenu.children) {
          // Pass parent roles to children for inheritance
          const newChild = loopRoutes(newMenu.children, userRole, newMenu.roles);
          if (newChild && newChild.length > 0) {
            newMenu.children = newChild;
            return newMenu;
          }
          return null;
        }
        return newMenu;
      }
      return null;
    })
    .filter((route: MenuDataItem) => Boolean(route));
}

interface MenuProps {
  menuList: MenuList;
  openKey?: string;
  onChangeOpenKey: (key?: string) => void;
  selectedKey: string;
  onChangeSelectedKey: (key: string) => void;
}

const MenuComponent: FC<MenuProps> = props => {
  const { menuList, openKey, onChangeOpenKey, selectedKey, onChangeSelectedKey } = props;

  const { device, updateCollapsed } = useGlobal();
  const navigate = useNavigate();

  const getTitle = (menu: MenuList[0]) => {
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {menu.icon}
        <span>{menu.name}</span>
      </span>
    );
  };

  const onMenuClick = (path: string) => {
    onChangeSelectedKey(path);
    navigate(path);

    if (device !== 'DESKTOP') {
      updateCollapsed(true);
    }
  };

  const onOpenChange = (keys: string[]) => {
    const key = keys.pop();

    onChangeOpenKey(key);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      openKeys={openKey ? [openKey] : []}
      onOpenChange={onOpenChange}
      onSelect={k => onMenuClick(k.key)}
      className="layout-page-sider-menu text-2"
      items={menuList.map(menu => {
        return menu.children
          ? {
              key: menu.path,
              label: getTitle(menu),
              children: menu.children.map(child => ({
                icon: child.icon,
                key: child.path,
                label: child.name,
              })),
            }
          : {
              key: menu.path,
              label: getTitle(menu),
            };
      })}
    ></Menu>
  );
};

export default MenuComponent;

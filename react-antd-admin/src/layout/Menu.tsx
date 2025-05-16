import { MenuDataItem, MenuList } from 'interfaces/menu';
import type { FC } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useGlobal } from '@hooks/useGlobalContext';
import { AbilityContext, Actions } from '../configs/ability';
import { SPECIAL_RESOURCES, SPECIAL_ACTIONS, SUPERADMIN_ROLE } from '../constants/permissions';
import { SubjectRawRule } from '@casl/ability';
import menuData from './menuData';

export const getMenuList = () => {
  const routes = menuData.routes.map(route => ({
    ...route,
    action: route.action as Actions,
    children: route.children?.map(child => ({
      ...child,
      action: child.action as Actions
    }))
  }));
  const newMenu = loopRoutes(routes);
  return newMenu;
};

function getMenuItem(menuItemData: MenuDataItem): MenuDataItem | null {
  return menuItemData;
}

function loopRoutes(routes: MenuDataItem[]): MenuDataItem[] {
  return routes
    .map((route: MenuDataItem) => {
      const newMenu = getMenuItem(route);
      if (newMenu) {
        if (newMenu.children) {
          const newChild = loopRoutes(newMenu.children);
          if (newChild && newChild.length > 0) {
            return {
              ...newMenu,
              children: newChild
            };
          }
          return null;
        }
        return newMenu;
      }
      return null;
    })
    .filter((item): item is MenuDataItem => item !== null);
}

interface MenuComponentProps {
  menuList: MenuList;
  openKey?: string;
  onChangeOpenKey: (key?: string) => void;
  selectedKey: string;
  onChangeSelectedKey: (key: string) => void;
}

const MenuComponent: FC<MenuComponentProps> = props => {
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

  const ability = useContext(AbilityContext);

  const checkPermission = (item: MenuDataItem): boolean => {
    if (!item.action || !item.subject) return true;

    // Check for superadmin role
    if (ability.can('manage', 'all')) return true;

    // Check for wildcard resource access
    if (ability.can(item.action, SPECIAL_RESOURCES.ALL) ||
        ability.can(item.action, SPECIAL_RESOURCES.WILDCARD)) {
      return true;
    }

    // Check for manage action access
    if (ability.can(SPECIAL_ACTIONS.MANAGE, item.subject) ||
        ability.can(SPECIAL_ACTIONS.ALL, item.subject)) {
      return true;
    }

    // Regular permission check
    return ability.can(item.action, item.subject);
  };

  const renderMenuChild = (child: MenuDataItem): Required<MenuProps>['items'][number] | null => {
    if (!checkPermission(child)) return null;

    return {
      key: child.path,
      icon: child.icon,
      label: child.name,
    };
  };

  const renderMenuItem = (menu: MenuDataItem): Required<MenuProps>['items'][number] | null => {
    if (!checkPermission(menu)) return null;

    const children = menu.children
      ?.map(renderMenuChild)
      .filter((item): item is Required<MenuProps>['items'][number] => item !== null);

    return {
      key: menu.path,
      label: getTitle(menu),
      children: children && children.length > 0 ? children : undefined,
    };
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      openKeys={openKey ? [openKey] : []}
      onOpenChange={onOpenChange}
      onSelect={k => onMenuClick(k.key)}
      className="layout-page-sider-menu text-2"
      items={menuList.map(renderMenuItem).filter((item): item is Required<MenuProps>['items'][number] => item !== null)}
    />
  );
};

export default MenuComponent;

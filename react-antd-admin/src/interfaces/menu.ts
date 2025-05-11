interface MenuItem {
  /** menu item code */
  code: string;
  /** menu labels */
  name: any;
  /** icon name
   *
   * Sub-submenus do not need icons
   */
  icon?: string;
  /** menu route */
  path: string;
  /** submenus */
  children?: MenuItem[];
}

export type MenuChild = Omit<MenuItem, 'children'>;

export type MenuList = MenuItem[];

export type MenuDataList = MenuItemData[];

export type MenuDataItem = MenuItemData;

export interface MenuItemData extends MenuItem {
  /** user roles */
  roles?: string[];
}

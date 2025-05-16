import { ReactNode } from 'react';
import { Actions, Subjects } from '../configs/ability';

export interface MenuDataItem {
  path: string;
  name: string;
  icon?: ReactNode;
  children?: MenuDataItem[];
  action?: Actions;
  subject?: Subjects;
}

export type MenuList = MenuDataItem[];

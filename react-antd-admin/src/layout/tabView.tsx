import { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { TabItem } from '@interfaces/tabsView';
import { addTab, removeTab, removeOtherTab, removeAllTab } from '@stores/tabs-view.store';
import { useGlobal } from '@hooks/useGlobalContext';
import { MenuList } from '@interfaces/menu';

const { TabPane } = Tabs;

export default function TabsView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { menuList } = useGlobal();
  const tabs = useSelector((state: any) => state.tabsView.tabs);

  const [activeKey, setActiveKey] = useState<string>();

  useEffect(() => {
    const find = menuList.find((item: MenuList[0]) => item.path === pathname);
    if (find) {
      setActiveKey(pathname);
      const exists = tabs.find((item: TabItem) => item.path === pathname);
      if (!exists) {
        dispatch(addTab({ name: find.name, path: find.path, closable: find.path !== '/welcome' }));
      }
    }
  }, [pathname, menuList, dispatch, tabs]);

  const handleTabRemove = (targetKey: string, action: 'remove' | 'removeOther' | 'removeAll') => {
    switch (action) {
      case 'remove':
        dispatch(removeTab(targetKey));
        if (pathname === targetKey) {
          const lastTab = tabs[tabs.length - 1];
          if (lastTab) {
            navigate(lastTab.path);
          }
        }
        break;
      case 'removeOther':
        dispatch(removeOtherTab());
        navigate(targetKey);
        break;
      case 'removeAll':
        dispatch(removeAllTab());
        navigate('/welcome');
        break;
      default:
        break;
    }
  };

  return tabs.length ? (
    <Tabs
      className="tabs-view"
      activeKey={activeKey}
      type="editable-card"
      hideAdd
      onChange={key => {
        setActiveKey(key);
        navigate(key);
      }}
      onEdit={(targetKey, action) => {
        if (action === 'remove' && typeof targetKey === 'string') {
          handleTabRemove(targetKey, 'remove');
        }
      }}
      items={tabs.map((item: TabItem) => ({
        key: item.path,
        closable: item.closable,
        label: item.name,
      }))}
    />
  ) : null;
}
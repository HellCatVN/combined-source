import type { FC } from 'react';

import { Tabs } from 'antd';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { addTab, removeTab, setActiveTab } from '@stores/tabs-view.store';

import { useGlobal } from '@hooks/useGlobalContext';
import TabsViewAction from './tabViewAction';

const TabsView: FC = () => {
  const { tabs, activeTabId } = useSelector((state: any) => state.tabsView);
  const { menuList } = useGlobal();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // onClick tab
  const onChange = (key: string) => {
    const tab = tabs.find((tab: any) => tab.path === key);

    if (tab) {
      setCurrentTab(tab.path);
    }
  };

  // onRemove tab
  const onClose = async (targetKey: string) => {
    dispatch(removeTab(targetKey));
  };

  useEffect(() => {
    navigate(activeTabId);
  }, [activeTabId, navigate]);

  const setCurrentTab = useCallback(
    (id?: string) => {
      const tab = tabs.find((item: any) => {
        if (id) {
          return item.path === id;
        } else {
          return item.path === location.pathname;
        }
      });

      if (tab) {
        navigate(tab.path);
        dispatch(setActiveTab(tab.path));
      }
    },
    [dispatch, location.pathname, tabs, navigate]
  );

  useEffect(() => {
    if (menuList.length) {
      let menu;
      for (let i = 0; i < menuList.length; i++) {
        menu = menuList.find((item: any) => item.path === location.pathname);
        if (menu) {
          break;
        } else {
          menu = menuList[i].children?.find((item: any) => item.path === location.pathname);
          if (menu) {
            break;
          }
        }
      }
      if (menu) {
        navigate(menu.path);
        dispatch(
          addTab({
            name: menu.name,
            path: menu.path,
            closable: true,
          })
        );
      }
    }
  }, [dispatch, location.pathname, menuList, navigate]);

  return (
    <div id="pageTabs" style={{ padding: '6px 4px' }}>
      <Tabs
        tabBarStyle={{ margin: 0 }}
        onChange={onChange}
        activeKey={activeTabId}
        type="editable-card"
        hideAdd
        onEdit={(targetKey, action) => action === 'remove' && onClose(targetKey as string)}
        tabBarExtraContent={<TabsViewAction />}
        items={tabs.map((tab: any) => {
          return {
            key: tab.path,
            closable: tab.closable,
            label: tab.name,
          };
        })}
      />
    </div>
  );
};

export default TabsView;

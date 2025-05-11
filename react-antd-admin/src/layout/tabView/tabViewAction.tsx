import type { FC } from 'react';

import { SettingOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { removeAllTab, removeOtherTab, removeTab } from '@stores/tabs-view.store';

const TabsViewAction: FC = () => {
  let navigate = useNavigate();
  const { activeTabId } = useSelector((state: any) => state.tabsView);
  const dispatch = useDispatch();

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: '0',
            onClick: () => dispatch(removeTab(activeTabId)),
            label: 'Close Current',
          },
          {
            key: '1',
            onClick: () => dispatch(removeOtherTab()),
            label: 'Close Other',
          },
          {
            key: '2',
            onClick: () => {
              dispatch(removeAllTab());
              navigate('/welcome');
            },
            label: 'Close All',
          },
          {
            key: '3',
            type: 'divider',
          },
          {
            key: '4',
            label: <Link to="/">Dashboard</Link>,
          },
        ],
      }}
    >
      <span id="pageTabs-actions">
        <SettingOutlined className="tabsView-extra" />
      </span>
    </Dropdown>
  );
};

export default TabsViewAction;

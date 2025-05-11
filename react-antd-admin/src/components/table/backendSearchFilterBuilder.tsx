import { SearchOutlined } from '@ant-design/icons';
import { InputRef, TableColumnType } from 'antd';
import { RefObject } from 'react';
import SearchDropdown from './SearchDropdown';

const backendSearchFilterBuilder = (
  dataIndex: string,
  searchInput: RefObject<InputRef>,
  triggerSearchFunc: Function
): TableColumnType<any> => ({
  filterDropdown: ({ close }) => (
    <SearchDropdown dataIndex={dataIndex} close={close} searchFunc={triggerSearchFunc} />
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
  ),
  filterDropdownProps: {
    onOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  },
});

export default backendSearchFilterBuilder;

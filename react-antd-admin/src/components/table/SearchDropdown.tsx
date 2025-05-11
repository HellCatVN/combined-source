import { Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

const SearchDropdown = ({ close, dataIndex, searchFunc }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleReset = () => {
    setSearchTerm("");
  };

  return (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        placeholder={`Search ${dataIndex}`}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        onPressEnter={() => {
          searchFunc(dataIndex, searchTerm);
        }}
        style={{ marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            searchFunc(dataIndex, searchTerm);
          }}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset()}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
        <Button
          danger
          size="small"
          onClick={() => {
            close();
          }}
        >
          Close
        </Button>
      </Space>
    </div>
  );
};

export default SearchDropdown;

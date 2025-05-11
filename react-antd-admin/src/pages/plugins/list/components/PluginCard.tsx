import { Button, Card, Space, Tag, Typography, Badge, Collapse } from "antd";
import { 
  ReloadOutlined, 
  FileOutlined, 
  ClockCircleOutlined, 
  InfoCircleOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  SyncOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { IPlugin } from "@interfaces/plugin";
import { FC } from "react";

const { Text } = Typography;

interface PluginCardProps {
  plugin: IPlugin;
  isUpdateInProgress: boolean;
  onUpdate: (pluginId: string, sourceName: string) => void;
  onDownload: (pluginId: string, sourceName: string) => void;
  onSync: (pluginId: string, sourceName: string) => void;
}

export const PluginCard: FC<PluginCardProps> = ({
  plugin,
  isUpdateInProgress,
  onUpdate,
  onDownload,
  onSync,
}) => {
  const collapseItems = [{
    key: '1',
    label: (
      <Space>
        <FileOutlined style={{ color: '#52c41a' }} />
        <Text>{plugin.metadata.totalFiles} files monitored</Text>
      </Space>
    ),
    children: (
      <ul style={{ margin: 0, paddingLeft: 24 }}>
        {plugin.metadata.watchingFiles.map((file, index) => (
          <li key={index}>
            <Text>{file.filePath}</Text>
          </li>
        ))}
      </ul>
    ),
  }];

  const sourceTypeColor = plugin.sourceType === 'source-code' ? '#f50' : '#eb2f96';

  return (
    <Badge.Ribbon 
      text={`v${plugin.metadata.currentVersion}`} 
      color={plugin.isActive ? "blue" : "gray"}
    >
      <Card
        title={plugin.sourceName}
        actions={[
          plugin.installed ? (
            <Button
              key="update"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => onUpdate(plugin._id, plugin.sourceName)}
              disabled={isUpdateInProgress}
            >
              Update Local
            </Button>
          ) : (
            <Button
              key="download"
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              icon={<DownloadOutlined />}
              onClick={() => onDownload(plugin._id, plugin.sourceName)}
              disabled={isUpdateInProgress}
            >
              Download
            </Button>
          ),
          <Button
            key="sync"
            type="primary"
            style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            icon={<SyncOutlined />}
            onClick={() => onSync(plugin._id, plugin.sourceName)}
            disabled={isUpdateInProgress}
          >
            Upload Remote
          </Button>,
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space>
            <CodeOutlined style={{ color: '#1890ff' }} />
            <Text>Source name:</Text>
            <Text strong>{plugin.sourceName}</Text>
          </Space>

          <Space>
            <AppstoreOutlined style={{ color: sourceTypeColor }} />
            <Text>Type:</Text>
            <Tag color={sourceTypeColor}>
              {plugin.sourceType === 'source-code' ? 'Source Code' : 'Plugin'}
            </Tag>
          </Space>

          <Space>
            <CheckCircleOutlined style={{ color: plugin.isActive ? '#52c41a' : '#d9d9d9' }} />
            <Text>Status:</Text>
            <Tag color={plugin.isActive ? "success" : "default"}>
              {plugin.isActive ? "Active" : "Inactive"}
            </Tag>
          </Space>

          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text>{plugin.description}</Text>
          </Space>
          
          <Collapse ghost items={collapseItems} />

          <Space>
            <ClockCircleOutlined style={{ color: '#722ed1' }} />
            <Text>Last updated:</Text>
            <Badge 
              count={dayjs(plugin.metadata.lastVersionedAt).format("YYYY-MM-DD HH:mm")}
              style={{ backgroundColor: '#722ed1' }}
            />
          </Space>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};
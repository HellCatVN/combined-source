import { usePlugins, useUploadSource, useUpdateSource } from "@hooks/react-query/usePlugins";
import { Card, Row, Col, Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { IPlugin } from "@interfaces/plugin";
import { PluginCard } from "./components/PluginCard";

const PluginList = () => {
  const { data: pluginData, isLoading, refetch } = usePlugins();
  const uploadSourceMutation = useUploadSource();
  const updateSourceMutation = useUpdateSource();
  const [messageApi, contextHolder] = message.useMessage();

  const handleUpdate = async (pluginId: string, sourceName: string) => {
    try {
      await updateSourceMutation.mutateAsync(pluginId);
      messageApi.success(`Successfully updated source: ${sourceName}`);
    } catch (error) {
      messageApi.error(`Failed to update source: ${sourceName}`);
    }
  };

  const handleDownload = (pluginId: string, sourceName: string) => {
    messageApi.info(`Downloading plugin: ${sourceName} (${pluginId})`);
    // TODO: Implement download functionality when API is available
  };

  const handleSync = async (pluginId: string, sourceName: string) => {
    try {
      await uploadSourceMutation.mutateAsync(pluginId);
      messageApi.success(`Successfully synced plugin: ${sourceName}`);
    } catch (error) {
      messageApi.error(`Failed to sync plugin: ${sourceName}`);
    }
  };

  const handleRefresh = () => {
    refetch();
    messageApi.info('Refreshing plugins list...');
  };

  if (isLoading) {
    return <Card loading />;
  }

  const isUpdateInProgress = pluginData?.data.isUpdateInProgress ?? false;
  const isAnyMutationLoading = uploadSourceMutation.isLoading || updateSourceMutation.isLoading;

  // Sort plugins to show source-code types first
  const sortedPlugins = [...(pluginData?.data.sources || [])].sort((a, b) => {
    if (a.sourceType === 'source-code' && b.sourceType !== 'source-code') return -1;
    if (a.sourceType !== 'source-code' && b.sourceType === 'source-code') return 1;
    return a.sourceName.localeCompare(b.sourceName);
  });

  return (
    <div>
      {contextHolder}
      <Row justify="end" style={{ padding: "24px 24px 0" }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Row>
      <Row gutter={[16, 16]} style={{ padding: 24 }}>
        {sortedPlugins.map((plugin: IPlugin) => (
          <Col xs={24} sm={24} md={12} lg={12} key={plugin._id}>
            <PluginCard
              plugin={plugin}
              isUpdateInProgress={isUpdateInProgress || isAnyMutationLoading}
              onUpdate={handleUpdate}
              onDownload={handleDownload}
              onSync={handleSync}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PluginList;
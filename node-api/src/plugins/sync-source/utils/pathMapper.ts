import path from 'path';
import fs from 'fs/promises';

export class PathMapper {
  /**
   * Maps a file path from API to its actual location based on source type
   */
  public static async mapFilePath(filePath: string, sourceName: string, manifestPath: string): Promise<string> {
    try {
      // Read manifest.json to determine source type and root path
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      const sourceType = manifest.type || 'plugin'; // Default to plugin type

      switch (sourceType) {
        case 'node-api':
          return path.join(process.cwd(), filePath);
          
        case 'react-antd-admin':
          return path.join(path.dirname(manifestPath), filePath);
          
        case 'plugin':
        default:
          // For plugins, prepend the plugin's root path
          const pluginRoot = path.dirname(manifestPath);
          return path.join(pluginRoot, filePath);
      }
    } catch (error) {
      console.error(`Failed to map path for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Gets the manifest path for a source
   */
  public static async getManifestPath(sourceName: string): Promise<string> {
    // First check in plugins directory
    const pluginManifestPath = path.join(process.cwd(), 'src', 'plugins', sourceName, 'manifest.json');
    try {
      await fs.access(pluginManifestPath);
      return pluginManifestPath;
    } catch {
      // If not found in plugins, check root manifest for other types
      const rootManifestPath = path.join(process.cwd(), 'manifest.json');
      try {
        await fs.access(rootManifestPath);
        return rootManifestPath;
      } catch {
        throw new Error(`Manifest not found for source ${sourceName}`);
      }
    }
  }
}
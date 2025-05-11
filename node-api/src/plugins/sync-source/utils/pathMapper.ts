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
    let manifestPath: string;

    try {
      if (sourceName === 'node-api') {
        manifestPath = path.join(process.cwd(), 'manifest.json');
        await fs.access(manifestPath);
        return manifestPath;
      }

      if (sourceName === 'react-antd-admin') {
        manifestPath = path.join(process.cwd(), '..', 'react-antd-admin', 'manifest.json');
        await fs.access(manifestPath);
        return manifestPath;
      }

      // Check in plugins directory for other sources
      manifestPath = path.join(process.cwd(), 'src', 'plugins', sourceName, 'manifest.json');
      await fs.access(manifestPath);
      return manifestPath;
    } catch {
      throw new Error(`Manifest not found for source ${sourceName}`);
    }
  }
}
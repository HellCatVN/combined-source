import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FileContent } from '../interfaces/sync.interface';
import { PathMapper } from '../utils/pathMapper';
import { logger } from '@utils/logger';
import { sleep } from '@utils/index';

const execAsync = promisify(exec);

export class FileSystemService {
  private async restartService(): Promise<void> {
    logger.info('🔄 Restarting PM2 service...');
    await sleep(2000);
    await execAsync('pm2 restart node-api');
  }

  /**
   * Sync files with their mapped locations
   */
  public async syncFiles(files: FileContent[], sourceName: string): Promise<void> {
    try {
      const manifestPath = await PathMapper.getManifestPath(sourceName);
      
      for (const file of files) {
        console.log(`Syncing file: ${file.filePath}`);
        await this.syncFile(file, sourceName, manifestPath);
      }
    } catch (error) {
      logger.error('❌ Failed to sync files:', error);
      throw error;
    }
  }

  /**
   * Restart the service after all files are synced
   */
  public async triggerServiceRestart(): Promise<void> {
    await this.restartService();
    logger.info('================== ✅ Service restart completed successfully ✅ ==================');
  }

  /**
   * Sync a single file with its mapped location
   */
  private async syncFile(file: FileContent, sourceName: string, manifestPath: string): Promise<void> {
    try {
      // Map the file path to its actual location
      console.log(`Mapping file path for: ${manifestPath}`);
      throw new Error('Simulated error for testing');

      const mappedPath = await PathMapper.mapFilePath(file.filePath, sourceName, manifestPath);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(mappedPath), { recursive: true });

      let shouldUpdate = true;
      try {
        const currentContent = await fs.readFile(mappedPath, 'utf-8');
        shouldUpdate = currentContent !== file.content;
      } catch (err) {
        // File doesn't exist, will create it
      }

      if (shouldUpdate) {
        await fs.writeFile(mappedPath, file.content, 'utf-8');
        logger.info(`📝 Updated file: ${mappedPath}`);
      } else {
        logger.debug(`💾 File unchanged: ${mappedPath}`);
      }
    } catch (error) {
      logger.error(`❌ Failed to sync file ${file.filePath}:`, error);
      throw error;
    }
  }

  /**
   * Rollback changes if synchronization fails
   */
  public async rollbackChanges(files: FileContent[], sourceName: string): Promise<void> {
    // Implementation for rollback if needed
    // This could restore from backup or implement other rollback strategies
    logger.warn('⚠️ Rolling back changes...');
  }
}

export const fileSystemService = new FileSystemService();
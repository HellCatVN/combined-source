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
  private async restartNodeService(): Promise<void> {
    logger.info('🔄 Restarting Node API service...');
    await sleep(2000);
    await execAsync('pm2 restart node-api');
  }

  private async restartReactAdminService(): Promise<void> {
    logger.info('🔄 Building and restarting React Admin...');
    await sleep(2000);
    // Navigate to parent directory where react-antd-admin is located
    const adminPath = path.join(process.cwd(), '..', 'react-antd-admin');
    await execAsync('npm run build', { cwd: adminPath });
    await execAsync('pm2 restart admin');
  }

  /**
   * Sync files with their mapped locations
   */
  public async syncFiles(files: FileContent[], sourceName: string): Promise<void> {
    try {
      const manifestPath = await PathMapper.getManifestPath(sourceName);
      const fileStatuses = [];

      // Sync the files and collect statuses
      for (const file of files) {
        const status = await this.syncFile(file, sourceName, manifestPath);
        if (status) {
          fileStatuses.push(status);
        }
      }

      // Display consolidated table of all file statuses
      if (fileStatuses.length > 0) {
        console.log('\n📝 File Sync Summary:');
        console.table(fileStatuses);
      }
    } catch (error) {
      logger.error('❌ Failed to sync files:', error);
      throw error;
    }
  }

  /**
   * Restart the service after all files are synced
   */
  public async triggerServiceRestart(sourceName: string): Promise<void> {
    try {
      switch (sourceName) {
        case 'node-api':
          await this.restartNodeService();
          break;
        case 'react-antd-admin':
          await this.restartReactAdminService();
          break;
        default:
          await this.restartReactAdminService();
          await sleep(2000);
          await this.restartNodeService();
          return;
      }
    } catch (error) {
      logger.info(`================== ✅ Service restart completed successfully for ${sourceName} ✅ ==================`);
    }
  }

  /**
   * Sync a single file with its mapped location
   */
  private async syncFile(file: FileContent, sourceName: string, manifestPath: string): Promise<any> {
    try {
      // Map the file path to its actual location
      const mappedPath = await PathMapper.mapFilePath(file.filePath, sourceName, manifestPath);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(mappedPath), { recursive: true });

      let fileStatus = {
        'File Path': mappedPath,
        'Status': '',
        'Action': ''
      };

      try {
        await fs.access(mappedPath);
        const currentContent = await fs.readFile(mappedPath, 'utf-8');
        if (currentContent === file.content) {
          fileStatus.Status = '💾 Unchanged';
          fileStatus.Action = 'No action needed';
          return fileStatus;
        }
        fileStatus.Status = '📝 Changed';
        fileStatus.Action = 'Overwriting file';
      } catch (err) {
        fileStatus.Status = '✨ New';
        fileStatus.Action = 'Creating file';
      }

      await fs.writeFile(mappedPath, file.content, 'utf-8');
      return fileStatus;
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
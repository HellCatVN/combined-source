import { sourceApiService } from './api.service';
import { FileContent, FileVersion } from '../interfaces/sync.interface';
import { HttpException } from '../../../exceptions/HttpException';
import { syncSourceContainer } from '../syncSourceContainer';
import { Model } from 'mongoose';
import { fileSystemService } from './fileSystem.service';
import { PathMapper } from '../utils/pathMapper';
import path from 'path';
import fs from 'fs/promises';

export class SourceService {
  private versionTrackingModel: Model<any>;

  constructor() {
    this.versionTrackingModel = syncSourceContainer.get('VersionTrackingCollection');
  }

  /**
   * Get all available sources
   */
  public async getSources() {
    try {
      const sources = await sourceApiService.getSources();
      const sourcesWithStatus = await Promise.all((sources?.data || []).map(async (source) => {
        const installed = await this.checkSourceExists(source.sourceName);
        return {
          ...source,
          installed,
        };
      }));

      // Check if any source is currently being updated
      const updateInProgress = await this.versionTrackingModel.findOne({ isUpdateInProgress: true });
      
      return {
        sources: sourcesWithStatus,
        isUpdateInProgress: !!updateInProgress
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if a source exists on the server by its name
   */
  private async checkSourceExists(sourceName: string): Promise<boolean> {
    try {
      let checkPath: string;
      
      switch (sourceName) {
        case 'node-api':
          checkPath = process.cwd(); // Current working directory
          break;
        case 'react-antd-admin':
          checkPath = path.join(process.cwd(), '..', 'react-antd-admin'); // Parent folder's react-antd-admin
          break;
        default:
          // Default case: check plugins directory
          checkPath = path.join(process.cwd(), 'src', 'plugins', sourceName);
      }

      // Check if directory exists
      await fs.access(checkPath);

      // Check if manifest.json exists in the root folder
      const manifestPath = path.join(checkPath, 'manifest.json');
      await fs.access(manifestPath);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update source files from version control
   */
  public async updateSource(sourceId: string): Promise<void> {
    // Check if any source is being updated
    const updateInProgress = await this.versionTrackingModel.findOne({ 
      isUpdateInProgress: true 
    });
    
    if (updateInProgress) {
      throw new HttpException(409, 'Another source update is in progress');
    }

    // Get version tracking document
    let versionDoc = await this.versionTrackingModel.findOne({ sourceId });
    if (!versionDoc) {
      versionDoc = await this.versionTrackingModel.create({
        sourceId,
        currentVersion: '0.0.1',
        lastUpdated: new Date(),
        isUpdateInProgress: false
      });
    }

    // Set update lock
    await versionDoc.updateOne({ 
      isUpdateInProgress: true,
      lastUpdated: new Date() 
    });

    try {
      // Get file versions page by page
      let page = 1;
      const limit = 99;
      const allFilePaths: string[] = [];
      let sourceName: string;

      while (true) {
        const fileVersion = await sourceApiService.getFileVersions(
          sourceId,
          page,
          limit
        );

        // Store source name from first response
        if (page === 1) {
          sourceName = fileVersion.source;
        }

        // Extract file paths from the files array
        const filePaths = fileVersion.files.map(file => file.filePath);
        allFilePaths.push(...filePaths);

        if (page >= fileVersion.pagination.totalPages) break;
        page++;
      }

      // Process files in batches of 10
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < allFilePaths.length; i += batchSize) {
        batches.push(allFilePaths.slice(i, i + batchSize));
      }

      try {
        // Collect all file contents first
        const allFileContents = [];
        for (const batch of batches) {
          const fileContents = await sourceApiService.getFileContents(sourceId, batch);
          for (const fileContent of fileContents) {
            if (fileContent.filePath.includes('constants/index.ts')) {
              console.log(fileContent);
            }
          }
          allFileContents.push(...fileContents);
        }

        // const latestVersion1 = new Date().toISOString();
        // await versionDoc.updateOne({
        //   currentVersion: latestVersion1,
        //   lastUpdated: new Date(),
        //   isUpdateInProgress: false
        // });

        // return;

        // Display files that will be updated
        console.table(allFileContents.map(file => ({
          filePath: file.filePath,
          action: file.exists ? 'Overwrite' : 'Create'
        })));

        // Process the files
        await fileSystemService.syncFiles(allFileContents, sourceName);

        // Update version tracking
        const latestVersion = new Date().toISOString();
        await versionDoc.updateOne({
          currentVersion: latestVersion,
          lastUpdated: new Date(),
          isUpdateInProgress: false
        });

        // Trigger service restart after all batches are processed
        fileSystemService.triggerServiceRestart(sourceName);

        return;

      } catch (error) {
        // Attempt rollback if sync failed
        if (error instanceof Error) {
          console.error('Sync failed, attempting rollback:', error.message);
          await fileSystemService.rollbackChanges([], sourceName);
        }
        throw error;
      }

    } catch (error) {
      // Release lock on error
      await versionDoc.updateOne({ isUpdateInProgress: false });
      throw error;
    }
  }
}
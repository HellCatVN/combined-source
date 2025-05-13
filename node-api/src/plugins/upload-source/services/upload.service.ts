import { VersionControlAPIResponse } from "../interfaces/upload.interface";
import { FileToUpload, UploadStatus } from "../interfaces/uploadTracking.interface";
import { HttpException } from "../../../exceptions/HttpException";
import { PathMapper } from "../../sync-source/utils/pathMapper";
import { fileSystemService } from "./fileSystem.service";
import { remoteApiService } from "./remoteApi.service";
import { manifestService } from "./manifest.service";
import { versionTrackingService } from "./versionTracking.service";

class UploadService {
  private async prepareUpload(sourceId: string): Promise<{ manifestPath: string; sourceName: string }> {
    await versionTrackingService.checkUpdateInProgress(sourceId);
    await versionTrackingService.setUpdateInProgress(sourceId, true);

    const { sourceName } = await remoteApiService.getSourceInfo(sourceId);
    if (!sourceName) {
      throw new HttpException(404, 'Source not found');
    }

    const manifestPath = await PathMapper.getManifestPath(sourceName);
    return { manifestPath, sourceName };
  }

  private async getValidFiles(manifestPath: string): Promise<string[]> {
    const manifest = await manifestService.readManifest(manifestPath);
    const manifestDir = manifestPath.substring(0, manifestPath.lastIndexOf('/'));
    
    // Convert manifest relative paths to absolute paths and filter valid files
    return manifest.files
      .map(file => `${manifestDir}/${file.filePath}`.replace(/\/+/g, '/'));
  }

  private async buildRemoteContentsMap(sourceId: string, validFiles: string[], manifestPath: string): Promise<Map<string, string>> {
    const remoteContents = new Map<string, string>();
    
    for (const filePath of validFiles) {
      const relativePath = fileSystemService.getRelativePath(manifestPath, filePath);
      try {
        const remoteContent = await remoteApiService.getRemoteFileContent(sourceId, relativePath);
        remoteContents.set(relativePath, remoteContent);
      } catch (error) {
        console.log(`No remote content found for ${relativePath}, will be treated as new file`);
      }
    }

    return remoteContents;
  }

  private async uploadFiles(
    files: string[], 
    manifestPath: string,
    sourceId: string,
    remoteContents: Map<string, string>,
    newFiles: string[]
  ): Promise<UploadStatus[]> {
    const completedUploads: UploadStatus[] = [];

    const uploadPromises = files.map(async (filePath) => {
      const stats = await fileSystemService.getFileStats(filePath);
      const content = await fileSystemService.readFileContent(filePath);
      const relativePath = fileSystemService.getRelativePath(manifestPath, filePath);

      // Handle manifest file
      if (manifestService.isManifestFile(filePath, manifestPath)) {
        const remoteContent = remoteContents.get(relativePath);
        if (remoteContent !== content) {
          await remoteApiService.uploadFile({
            filePath: relativePath,
            content,
            sourceId,
            incrementType: "patch"
          });
          completedUploads.push({ status: "✅", file: relativePath, size: stats.size });
        } else {
          completedUploads.push({ status: "⏭️", file: relativePath, size: stats.size });
        }
        return;
      }

      // Handle other files
      const isNewFile = newFiles.includes(filePath);
      const remoteContent = remoteContents.get(relativePath);

      if (!isNewFile && remoteContent === content) {
        completedUploads.push({ status: "⏭️", file: relativePath, size: stats.size });
        return;
      }

      try {
        await remoteApiService.uploadFile({
          filePath: relativePath,
          content,
          sourceId,
          incrementType: versionTrackingService.generateVersionIncrement(isNewFile)
        });
        completedUploads.push({
          status: isNewFile ? "🆕" : "✅",
          file: relativePath,
          size: stats.size
        });
      } catch (error) {
        completedUploads.push({ status: "❌", file: relativePath, size: stats.size });
        throw error;
      }
    });

    await Promise.all(uploadPromises);
    return completedUploads;
  }

  private logUploadResults(completedUploads: UploadStatus[]): void {
    const newFilesCount = completedUploads.filter(u => u.status === "🆕").length;
    const updatedFilesCount = completedUploads.filter(u => u.status === "✅").length;
    const skippedFilesCount = completedUploads.filter(u => u.status === "⏭️").length;
    const failedFilesCount = completedUploads.filter(u => u.status === "❌").length;

    console.log("\nUpload Summary:");
    console.log(`✅ Updated files: ${updatedFilesCount} files`);
    console.log(`🆕 New files added: ${newFilesCount} files`);
    console.log(`⏭️ Skipped files: ${skippedFilesCount} files`);
    if (failedFilesCount > 0) {
      console.log(`❌ Failed to upload: ${failedFilesCount} files`);
    }
  }

  public async uploadChangedFiles(sourceId: string): Promise<VersionControlAPIResponse> {
    try {
      // Initial setup
      const { manifestPath, sourceName } = await this.prepareUpload(sourceId);

      // Get and validate files
      const validFiles = await this.getValidFiles(manifestPath);
      if (!validFiles.length) {
        return { success: true, message: "No files found in source directory" };
      }

      // Get remote contents
      const remoteContents = await this.buildRemoteContentsMap(sourceId, validFiles, manifestPath);

      // Get manifest content and find new files
      const manifestContent = await manifestService.readManifest(manifestPath);
      const newFiles = manifestService.getNewFiles(validFiles, manifestContent, manifestPath);

      // Update manifest locally
      await manifestService.updateManifest(manifestPath, newFiles, sourceName);
      // Check if manifest content has changed
      const currentManifestContent = await fileSystemService.readFileContent(manifestPath);

      const remoteManifestContent = remoteContents.get(
        fileSystemService.getRelativePath(manifestPath, manifestPath)
      );

      // Prepare files for upload, include manifest only if changed and not already included
      const allFiles = Array.from(new Set([...validFiles]));
      if (currentManifestContent !== remoteManifestContent) {
        if(!allFiles.includes(manifestPath)) {
          allFiles.push(manifestPath);
        }
      }

      // Prepare list of files to be uploaded
      const filesToUpload = await Promise.all(allFiles.map(async (filePath) => {
        const stats = await fileSystemService.getFileStats(filePath);
        const relativePath = fileSystemService.getRelativePath(manifestPath, filePath);
        return {
          file: relativePath,
          size: stats.size,
        };
      }));

      console.log("\nScaned Files:");
      console.table(filesToUpload);
      
      // Upload files
      const completedUploads = await this.uploadFiles(
        allFiles,
        manifestPath,
        sourceId,
        remoteContents,
        newFiles
      );

      console.log("\nUpload Results:");
      console.table(completedUploads);

      // Log summary
      this.logUploadResults(completedUploads);

      // Check for failures
      const failedCount = completedUploads.filter(u => u.status === "❌").length;
      if (failedCount > 0) {
        throw new HttpException(500, `Failed to upload ${failedCount} out of ${allFiles.length} files`);
      }

      return {
        success: true,
        message: `Successfully processed ${allFiles.length} files`
      };

    } catch (error) {
      console.error("Error during upload:", error);
      throw error instanceof HttpException ? error : new HttpException(500, "Error uploading files to remote location");
    } finally {
      await versionTrackingService.setUpdateInProgress(sourceId, false);
    }
  }
}

export const uploadService = new UploadService();

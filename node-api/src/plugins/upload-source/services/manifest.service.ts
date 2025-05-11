import fs from "fs/promises";
import { ManifestFile } from "../interfaces/upload.interface";
import { fileSystemService } from "./fileSystem.service";

class ManifestService {
  async readManifest(manifestPath: string): Promise<ManifestFile> {
    try {
      const content = await fileSystemService.readFileContent(manifestPath);
      const manifestContent = JSON.parse(content);
      if (!manifestContent.files) {
        manifestContent.files = [];
      }
      return manifestContent;
    } catch (error) {
      // If manifest doesn't exist or is invalid, create new one
      return {
        files: [],
        name: "",  // Will be set by caller
        version: "1.0.0"
      };
    }
  }

  async updateManifest(
    manifestPath: string,
    newFiles: string[],
    sourceName: string
  ): Promise<ManifestFile> {
    const manifestContent = await this.readManifest(manifestPath);
    manifestContent.name = sourceName;

    // Add new files if any exist
    if (newFiles.length > 0) {
      const newFileEntries = newFiles.map(filePath => ({
        filePath: fileSystemService.getRelativePath(manifestPath, filePath),
      }));
      manifestContent.files = [...manifestContent.files, ...newFileEntries];
    }

    return manifestContent;
  }

  isManifestFile(filePath: string, manifestPath: string): boolean {
    return filePath === manifestPath;
  }

  getNewFiles(validFiles: string[], manifestContent: ManifestFile, manifestPath: string): string[] {
    return validFiles.filter(filePath => {
      const relativePath = fileSystemService.getRelativePath(manifestPath, filePath);
      return !manifestContent.files.some(f => f.filePath === relativePath);
    });
  }
}

export const manifestService = new ManifestService();
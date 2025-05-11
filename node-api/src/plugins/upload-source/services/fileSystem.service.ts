import fs from "fs/promises";
import path from "path";

class FileSystemService {
  async getAllFiles(manifestPath: string): Promise<string[]> {
    const sourceDir = path.dirname(manifestPath);
    const files: string[] = [];

    const readDirRecursive = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await readDirRecursive(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    await readDirRecursive(sourceDir);
    return files;
  }

  async readFileContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
  }

  async getFileStats(filePath: string) {
    return await fs.stat(filePath);
  }

  getRelativePath(basePath: string, filePath: string): string {
    return path.relative(path.dirname(basePath), filePath);
  }
}

export const fileSystemService = new FileSystemService();
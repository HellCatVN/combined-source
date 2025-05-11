import axios from "axios";
import { FileUpload, SourceInfo } from "../interfaces/upload.interface";
import { HttpException } from "../../../exceptions/HttpException";

class RemoteApiService {
  private versionControlAPI: string;
  private uploadToken: string;
  private syncSourceToken: string;

  constructor() {
    this.versionControlAPI = process.env.VERSION_CONTROL_API || "";
    this.uploadToken = process.env.UPLOAD_SOURCE_SERVICE_TOKEN || "";
    this.syncSourceToken = process.env.SYNC_SOURCE_SERVICE_TOKEN || "";
  }

  async getSourceInfo(sourceId: string): Promise<SourceInfo> {
    try {
      const response = await axios.get(
        `${this.versionControlAPI}file-versions?sourceId=${sourceId}`,
        {
          headers: {
            Authorization: `Bearer ${this.syncSourceToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.data) {
        throw new Error(response.data.error || "Failed to get source info");
      }

      return {
        sourceName: response.data.data.source,
        filePaths: response.data.data.files,
      };
    } catch (error) {
      throw new HttpException(
        500,
        `Error getting source info: ${error.message}`
      );
    }
  }

  async getRemoteFileContent(sourceId: string, filePath: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.versionControlAPI}file-versions/version`,
        {
          sourceId,
          filePath,
        },
        {
          headers: {
            Authorization: `Bearer ${this.syncSourceToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.data) {
        throw new Error(response.data.error || "Failed to get remote file content");
      }

      return response.data.data.content;
    } catch (error) {
      throw new HttpException(
        error.response?.status || 500,
        `Error getting remote file content for ${filePath}: ${error.message}`
      );
    }
  }

  async uploadFile(fileData: FileUpload): Promise<void> {
    try {
      const response = await axios.post(
        `${this.versionControlAPI}file-versions`,
        fileData,
        {
          headers: {
            Authorization: `Bearer ${this.uploadToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.data.data) {
        throw new Error(response.data.error || "Failed to upload file");
      }
    } catch (error) {
      throw new HttpException(
        500,
        `Error uploading file ${fileData.filePath}: ${error.message}`
      );
    }
  }
}

export const remoteApiService = new RemoteApiService();
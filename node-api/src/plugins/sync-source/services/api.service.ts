import axios, { AxiosInstance } from 'axios';
import { FileContent, FileVersion, FileVersionResponse, FileContentResponse } from '../interfaces/sync.interface';

export class SourceApiService {
  private baseUrl: string;
  private apiClient: AxiosInstance;

  constructor() {
    if (!process.env.VERSION_CONTROL_API) {
      throw new Error('VERSION_CONTROL_API environment variable is not set');
    }
    if (!process.env.SYNC_SOURCE_SERVICE_TOKEN) {
      throw new Error('SYNC_SOURCE_SERVICE_TOKEN environment variable is not set');
    }

    this.baseUrl = process.env.VERSION_CONTROL_API;
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${process.env.SYNC_SOURCE_SERVICE_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Get source files content for a function
   */
  public async getSourceFiles(functionName: string): Promise<FileContent[]> {
    try {
      const response = await this.apiClient.get(`source/${functionName}/files`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get source files for ${functionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all available sources
   */
  public async getSources() {
    try {
      const response = await this.apiClient.get('sources');
      return response.data;
    } catch (error) {
      console.error('Failed to get sources:', error);
      throw error;
    }
  }

  /**
   * Get file versions for a source
   */
  public async getFileVersions(sourceId: string, page: number, limit: number): Promise<FileVersion> {
    try {
      const response = await this.apiClient.get('file-versions', {
        params: {
          sourceId,
          page,
          limit
        }
      });
      const { data } = response.data as FileVersionResponse;
      return data;
    } catch (error) {
      console.error('Failed to get file versions:', error);
      throw error;
    }
  }

  /**
   * Get contents for multiple files
   */
  public async getFileContents(sourceId: string, filePaths: string[]): Promise<FileContent[]> {
    try {
      const response = await this.apiClient.post('file-versions/contents', {
        sourceId,
        files: filePaths
      });
      const { data } = response.data as FileContentResponse;
      return data;
    } catch (error) {
      console.error('Failed to get file contents:', error);
      throw error;
    }
  }

  /**
   * Create an update function for a specific function name
   */
  public createUpdateSourceFunction(functionName: string) {
    return async () => {
      return this.getSourceFiles(functionName);
    };
  }
}

export const sourceApiService = new SourceApiService();
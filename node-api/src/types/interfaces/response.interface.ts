export interface ISuccessResponse<T> {
    status?: number;
    message: string;
    data: T;
  }
  
  export interface IPagination<T> {
    status?: number;
    message?: string;
    data: T;
    pagination: {
      current_page: number;
      limit: number;
      skip: number;
      total: number;
    };
  }
  
  export interface IResponseWriteFile {
    fileName: string;
    url: string;
  }
  
  export interface BackendErrorResponse {
    status: number;
    message: string;
  }
  
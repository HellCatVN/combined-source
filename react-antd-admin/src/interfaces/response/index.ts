export interface IPagination {
  current_page: number;
  limit: number;
  skip: number;
  total: number;
}

export interface IMessageSuccessResponse {
  message: string;
}

export interface ISuccessResponse<T> {
  message: string;
  data: T;
}

export type IPaginationSuccessResponse<T> = {
  data: T;
  pagination: IPagination;
};

export interface IWriteFileResponse {
  fileName: string;
  url: string;
}

export interface BackendErrorResponse {
  status: number;
  message: string;
}

export interface UploadStatus {
  status: "✅" | "❌" | "⏭️" | "🆕";
  file: string;
  size: number;
}

export interface UploadSummary {
  newFiles: number;
  updatedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  totalFiles: number;
}

export interface FileToUpload {
  file: string;
  size: number;
}
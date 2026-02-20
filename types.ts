
export enum ProcessingType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface MediaFile {
  file: File;
  preview: string;
  type: ProcessingType;
}

export interface ProcessingState {
  isProcessing: boolean;
  status: string;
  progress?: number;
}

export enum ContentTypes {
  VIDEO = "video",
  IMAGE = "image",
}

export interface IFile {
  fileName: string;
  url: string;
  fileSize: number;
  key: string;
  type: string;
  extension: string;
  contentType?: ContentTypes;
  uploadId?: string;
  thumbnail?: string;
}

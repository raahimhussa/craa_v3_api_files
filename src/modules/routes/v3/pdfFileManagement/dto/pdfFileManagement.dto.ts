/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export type PdfFileCreateDto = {
  name: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  folderId?: string;
};

export type PdfFile = {
  name: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
};

export type PdfFolder = {
  name: string;
  path: string;
  isRoot: boolean;
  isActivated: boolean;
  isDeleted: boolean;
  createdAt: boolean;
  updatedAt: boolean;
};

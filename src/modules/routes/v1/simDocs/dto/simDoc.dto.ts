import { File } from '../../files/schemas/files.schema';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class CreateSimDocDto {
  visibleId: number;
  folderId: string;
  kind: string;
  title: string;
  files: File[];
  numberOfPillsToShow: number;
  numberOfPillsTakenBySubject: number;
  numberOfPillsPrescribed: number;
  children: Array<any>;
  expanded: boolean;
  isActivated: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDemo: boolean;
  seq: number;
  demoId: string;
  label: string;
}

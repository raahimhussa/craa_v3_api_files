import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { File } from '../../files/schemas/files.schema';
import { Document } from 'mongoose';

enum Kind {
  Protocol = 'protocol',
  Instruction = 'instruction',
  StudyDocument = 'studyDocument',
}
/**
 * @description 프로토콜, 인스트럭션, 스터디도큐먼트를 저장하는 Collection
 */
@Schema()
export class Doc {
  readonly _id!: any;

  /**
   * @description Kind Enum 참고
   */
  @Prop({ required: true, default: Kind.StudyDocument })
  kind!: Kind;

  /**
   * @description 문서 타이틀
   */
  @Prop({ required: true })
  title!: string;

  /**
   * @description 문서 html콘텐츠
   */
  @Prop({ required: false, default: '' })
  htmlContent!: string;

  /**
   * @description 문서 file콘텐츠
   */
  @Prop({ required: false })
  file!: File;

  @Prop({ required: true, default: false })
  isDeleted!: boolean;

  @Prop({ required: true, type: Date })
  createdAt!: Date;

  @Prop({ required: true, type: Date })
  updatedAt!: Date;
}

export type DocDocument = Doc & Document;

export const DocSchema = SchemaFactory.createForClass(Doc).set(
  'versionKey',
  false,
);

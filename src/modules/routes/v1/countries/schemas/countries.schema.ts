import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * @description 국가 정보, 사용하지 않는 정보 많으나 뒤에 필요하다는 의견이 있어서 필드 유지
 */
@Schema()
export class Country {
  readonly _id!: any;

  /**
   * @description 국가명
   */
  @Prop({ required: true })
  name!: string;

  /**
   * @description 국가코드
   * 사용하지 않음.
   */
  @Prop({ required: true })
  code!: string;

  /**
   * @description 국가번호(전화번호 앞에 붙는 국가 코드)
   * 사용하지 않음.
   */
  @Prop({ required: true })
  phone!: number;

  /**
   * @description 국가심볼 ex) kr
   * 사용하지 않음.
   */
  @Prop({ required: true })
  symbol!: string;

  /**
   * @description 수도
   * 사용하지 않음.
   */
  @Prop({ required: false })
  capital!: string;

  /**
   * @description 화폐 단위
   * 사용하지 않음.
   */
  @Prop({ required: true })
  currency!: string;

  /**
   * @description 대륙
   * 사용하지 않음.
   */
  @Prop({ required: true })
  continent!: string;

  /**
   * @description 대륙코드
   * 사용하지 않음.
   */
  @Prop({ required: true })
  continent_code!: string;

  /**
   * @description 사용하지 않음.
   */
  @Prop({ required: true })
  alpha_3!: string;
}

export type CountryDocument = Country & Document;

export const CountrySchema = SchemaFactory.createForClass(Country).set(
  'versionKey',
  false,
);

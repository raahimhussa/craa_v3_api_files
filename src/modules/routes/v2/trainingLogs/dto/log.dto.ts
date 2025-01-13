import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class LogDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;
}

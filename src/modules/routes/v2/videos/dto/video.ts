import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class VideoDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  vimeoId: string;
  @ApiProperty()
  hParameter: string;
  @ApiProperty()
  embed: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  isActivated: boolean;
}

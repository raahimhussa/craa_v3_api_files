import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class VendorDto {
  @ApiProperty()
  label: string;

  // Vendor Client(리더)
  @ApiProperty()
  leaderClientId: string[];

  // Vendor Clients(하위 그룹)
  @ApiProperty()
  clientIds: string[];

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

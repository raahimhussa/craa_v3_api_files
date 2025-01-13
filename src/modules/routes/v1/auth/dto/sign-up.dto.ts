import { ApiProperty } from '@nestjs/swagger';

export default class SignUpDto {
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly username: string;
  @ApiProperty()
  readonly password: string;
}

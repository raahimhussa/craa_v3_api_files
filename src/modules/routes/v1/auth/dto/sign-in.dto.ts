import { ApiProperty } from '@nestjs/swagger';

export default class SignInDto {
  @ApiProperty()
  readonly username: string = '';
  @ApiProperty()
  readonly password: string = '';
}

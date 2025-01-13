import { PartialType } from '@nestjs/swagger';
import CreateFileDto from './create-file.dto';

export default class UpdateFileDto extends PartialType(CreateFileDto) {}

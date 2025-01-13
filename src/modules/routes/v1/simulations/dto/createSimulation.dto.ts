import { IsString } from 'class-validator';

export default class CreateSimulationDto {
  @IsString()
  readonly name: string = '';

  readonly label: string = '';

  readonly documents = [];

  readonly demoId?: number = 0;

  readonly isDemo?: boolean = false;
}

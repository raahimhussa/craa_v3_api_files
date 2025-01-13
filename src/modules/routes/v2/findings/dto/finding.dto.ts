import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO(Date Transfer Object)
 * 전송 데이터 객체
 */
export default class FindingDto {
  @ApiProperty()
  visibleId: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  severity: number;

  @ApiProperty()
  cfr: string;

  @ApiProperty()
  ich_gcp: string;

  @ApiProperty()
  domainId: string;

  @ApiProperty()
  simDocId: string;

  @ApiProperty()
  simDocIds: string[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  isActivated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  addedSimulationMappers?: { simulationId: number; findingId: number }[];

  @ApiProperty()
  removedSimulationMappers?: { simulationId: number; findingId: number }[];
}

export type FindingsArray = {
  id: number | null;
  finding: string | null;
  simulation_id: number | null;
  main_document_id: number | null;
  compare_with_1: number | null;
  compare_with_2: number | null;
  severity: string | null;
  cfr: string | null;
  ich_gcp: string | null;
  domain: string | null;
  domain_id: number | null;
  sub_domain_id: number | null;
}[];

import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';

import { AssessmentCycle } from './assessmentCycle.schema';
import AssessmentCyclesRepository from './assessmentCycles.repository';
import CreateAssessmentCycleDto from './dto/createAssessmentCycle.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssessmentCyclesService {
  constructor(
    private readonly assessmentCyclesRepository: AssessmentCyclesRepository,
  ) {}

  create(createAssessmentCycleDto: CreateAssessmentCycleDto) {
    return this.assessmentCyclesRepository.create(createAssessmentCycleDto);
  }

  bulkCreate(createAssessmentCycleDtos: CreateAssessmentCycleDto[]) {
    return this.assessmentCyclesRepository.bulkCreate(
      createAssessmentCycleDtos,
    );
  }

  find(query: FindQuery<AssessmentCycle>) {
    // console.log('query: ', JSON.stringify(query, null, 2));
    if (
      //-- when search string comes in, this quick-n-dirty solution fixes the issue
      //-- with empty search results when page number is bigger than 1 (11/22/2023, dk)
      query.filter.$or?.[0]?.name?.$regex != ''
    ) {
      query.options['skip'] = 0;
    }

    if (query.options?.multi) {
      return this.assessmentCyclesRepository.find(query);
    }
    return this.assessmentCyclesRepository.findOne(query);
  }

  count(query: FindQuery<AssessmentCycle>) {
    return this.assessmentCyclesRepository.count(query);
  }

  async findById(_id: any): Promise<AssessmentCycle | null> {
    return this.assessmentCyclesRepository.findById(_id);
  }

  update(
    body: PatchBody<AssessmentCycle>,
  ): Promise<AssessmentCycle | null> | Promise<AssessmentCycle[] | null> {
    if (body.options?.multi) {
      return this.assessmentCyclesRepository.updateOne(body);
    }
    return this.assessmentCyclesRepository.updateMany(body);
  }

  delete(query: DeleteQuery<AssessmentCycle>) {
    return this.assessmentCyclesRepository.deleteMany(query);
  }
}

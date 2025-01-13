import {
  AssessmentType,
  AssessmentTypeDocument,
} from './schemas/assessmentType.schema';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import AssessmentTypeDto from './dto/assessmentType.dto';
import AssessmentTypesRepository from './assessmentTypes.repository';
import { Injectable } from '@nestjs/common';
import TrainingsService from '../../v2/trainings/training.service';

@Injectable()
export default class AssessmentTypesService {
  constructor(
    private readonly assessmentTypesRepository: AssessmentTypesRepository,
    private readonly trainingsService: TrainingsService,
  ) {}

  create(assessmentType: AssessmentTypeDto): Promise<AssessmentType | null> {
    return this.assessmentTypesRepository.create(assessmentType);
  }

  bulkCreate(assessmentTypes: AssessmentTypeDto[]) {
    return this.assessmentTypesRepository.bulkCreate(assessmentTypes);
  }

  async find(query: MongoQuery<AssessmentType>) {
    if (query.options?.multi) {
      const assessmentTypes = await this.assessmentTypesRepository.find(query);
      const trainingIds = [] as string[];
      assessmentTypes?.forEach((_assessmentType) => {
        _assessmentType.trainings.forEach(
          (_training) => _training._id && trainingIds.push(_training._id),
        );
      });
      const trainings = await this.trainingsService.find({
        filter: {
          _id: { $in: trainingIds },
          isDeleted: false,
        },
      });
      assessmentTypes?.forEach((_assessmentType) => {
        _assessmentType.trainings.forEach(
          (_training) =>
            ((_training as any).training = trainings?.find(
              (__training) => __training._id.toString() === _training._id,
            )),
        );
      });
      return assessmentTypes;
    }
    const assessmentType = await this.assessmentTypesRepository.findOne(query);
    const trainingIds = [] as string[];
    assessmentType?.trainings.forEach((_training) =>
      trainingIds.push(_training._id),
    );
    const trainings = await this.trainingsService.find({
      filter: {
        _id: { $in: trainingIds },
        isDeleted: false,
      },
    });
    assessmentType?.trainings.forEach(
      (_training) =>
        ((_training as any).training = trainings?.find(
          (__training) => __training._id.toString() === _training._id,
        )),
    );
    return assessmentType;
  }

  async count(query: MongoQuery<AssessmentType>) {
    return this.assessmentTypesRepository.count(query);
  }

  findById(id: any): Promise<AssessmentType | null> {
    return this.assessmentTypesRepository.findById(id);
  }

  update(body: MongoUpdate<AssessmentTypeDocument>) {
    if (body.options?.multi) {
      return this.assessmentTypesRepository.updateOne(body);
    }
    return this.assessmentTypesRepository.updateMany(body);
  }

  delete(query: MongoDelete<AssessmentTypeDocument>) {
    return this.assessmentTypesRepository.deleteMany(query);
  }
}

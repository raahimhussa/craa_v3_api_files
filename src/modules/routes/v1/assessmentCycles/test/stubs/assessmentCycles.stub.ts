import { AssessmentCycle } from '../../assessmentCycle.schema';
import mongoose from 'mongoose';

const _id = new mongoose.Types.ObjectId();

export const assessmentCycleStub = (): AssessmentCycle => {
  return {
    _id: _id,
    name: 'name',
    type: 'type',
    tutorials: {
      followupUrl: 'followupUrl',
      baselineUrl: 'baselineUrl',
      trainingUrl: 'trainingUrl',
    },
    assessmentTypeIds: ['1', '2'],
    bypass: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    demoId: '',
    isDemo: false,
  };
};

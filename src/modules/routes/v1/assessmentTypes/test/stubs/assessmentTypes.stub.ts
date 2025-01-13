import { AssessmentType } from '../../schemas/assessmentType.schema';
import { Simulation } from '../../../simulations/schemas/simulation.schema';
import { SimulationType } from 'src/utils/status';
import mongoose from 'mongoose';

const _id = new mongoose.Types.ObjectId();

export const assessmentTypeStub = (): AssessmentType => {
  return {
    _id: _id,
    label: 'label',
    baseline: {
      simulationId: new mongoose.Types.ObjectId().toString(),

      simulationType: SimulationType.Baseline,

      label: 'label',

      attemptCount: 5,

      domain: {
        _id: new mongoose.Types.ObjectId().toString(),
        label: 'label',
      },

      uuid: 'uuid',

      testTime: 1000,

      minimumHour: 1,

      deadline: 1,

      protocolIds: ['1'],

      instructionIds: ['1'],

      studyLogIds: ['1'],

      riskManagementIds: ['1'],
    },
    followups: [
      {
        simulationId: new mongoose.Types.ObjectId().toString(),

        simulationType: SimulationType.Baseline,

        label: 'label',

        attemptCount: 5,

        domain: {
          _id: new mongoose.Types.ObjectId().toString(),
          label: 'label',
        },

        uuid: 'uuid',

        testTime: 1000,

        minimumHour: 1,

        deadline: 1,

        protocolIds: ['1'],

        instructionIds: ['1'],

        studyLogIds: ['1'],

        riskManagementIds: ['1'],
      },
    ],
    trainings: [
      {
        _id: new mongoose.Types.ObjectId().toString(),

        label: 'label',

        protocolIds: ['1'],

        studyLogIds: ['1'],
        domain: 'domain',
      },
    ],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    demoId: '',
    isDemo: false,
  };
};

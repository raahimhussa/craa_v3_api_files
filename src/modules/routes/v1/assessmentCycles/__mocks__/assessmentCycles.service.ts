import { assessmentCycleStub } from '../test/stubs/assessmentCycles.stub';

export const AssesmentCyclesService = jest.fn().mockReturnValue({
  find: jest.fn().mockReturnValue([assessmentCycleStub()]),
  findById: jest.fn().mockReturnValue([assessmentCycleStub()]),
  create: jest.fn().mockReturnValue(assessmentCycleStub()),
  update: jest.fn().mockReturnValue(assessmentCycleStub()),
  delete: jest.fn().mockReturnValue({ acknowledged: true, deletedCount: 1 }),
});

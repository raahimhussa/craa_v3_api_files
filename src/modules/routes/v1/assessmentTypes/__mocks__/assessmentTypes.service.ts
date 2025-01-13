import { assessmentTypeStub } from '../test/stubs/assessmentTypes.stub';

export const AssessmentTypesService = jest.fn().mockReturnValue({
  find: jest.fn().mockReturnValue([assessmentTypeStub()]),
  findById: jest.fn().mockReturnValue(assessmentTypeStub()),
  create: jest.fn().mockReturnValue(assessmentTypeStub()),
  update: jest.fn().mockReturnValue(assessmentTypeStub()),
  delete: jest.fn().mockReturnValue(assessmentTypeStub()),
});

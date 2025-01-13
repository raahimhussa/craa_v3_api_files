import { agreementStub } from '../test/stubs/agreements.stub';

export const AgreementsService = jest.fn().mockReturnValue({
  find: jest.fn().mockReturnValue([agreementStub()]),
  create: jest.fn().mockReturnValue(agreementStub()),
  update: jest.fn().mockReturnValue(agreementStub()),
  delete: jest.fn().mockReturnValue(agreementStub()),
});

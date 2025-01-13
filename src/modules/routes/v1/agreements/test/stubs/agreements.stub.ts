import mongoose from 'mongoose';
import { Agreement, AgreementKind } from '../../schemas/agreement.schema';

const _id = new mongoose.Types.ObjectId();

export const agreementStub = (): Agreement => {
  return {
    _id: _id,
    kind: AgreementKind.PrivacyPolicy,
    key: 'test-key',
    label: 'label',
    htmlContent: 'htmlContent',
    isRequired: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

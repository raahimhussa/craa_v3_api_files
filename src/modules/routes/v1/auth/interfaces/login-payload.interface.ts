import { Types } from 'mongoose';

export interface LoginPayload {
  readonly _id?: Types.ObjectId;

  readonly email: string;

  readonly roleId: string;

  readonly profileId: string;

  readonly name: string;
}

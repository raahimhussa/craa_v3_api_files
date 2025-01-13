import { Types } from 'mongoose';

export interface DecodedUser {
  readonly _id: Types.ObjectId;

  readonly email: string;

  readonly name: string;

  readonly roleId: string;

  readonly profileId: string;

  readonly iat?: number;

  readonly exp?: number;
}

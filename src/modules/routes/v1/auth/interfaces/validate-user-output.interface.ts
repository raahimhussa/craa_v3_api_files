import { Types } from 'mongoose';
import { RolesEnum } from 'src/common/decorators/roles.decorator';

export interface ValidateUserOutput {
  _id: Types.ObjectId;
  email?: string;
  role?: RolesEnum;
  username?: string;
}

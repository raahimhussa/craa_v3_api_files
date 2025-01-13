export class UserStatus {
  socketId = '';
  online = false;
  logoutAt: Date = new Date();
  signinAt: Date = new Date();
}

export class Authority {
  authorizedAll: boolean;
  pfizerAdmin: boolean;
  publishNotification: boolean;
  distributionNotification: boolean;
  whitelist: ClientUnitAuthority[];
}

export class ClientUnitAuthority {
  clientId: string;
  businessUnits: string[];
  countryPermissions: [];
  simPermissions: {};
  resultsView: string;
}

export interface UserInterface {
  readonly _id: any;
  readonly email: string;
  readonly password?: string;
  readonly name?: string;
  readonly roleId: string;
  readonly profileId: string;
  readonly status: string;
}

export enum UserProfileStatus {
  Approval = 'approval',
  Dropout = 'dropout',
  Verified = 'verified',
}

export class Profile {
  // userId: string;
  countryId: string;
  clientUnitId: string;
  businessUnitId: string;
  lastName: string;
  firstName: string;
  status: UserProfileStatus;
  authCode: string;
  initial: string;
  title: string;
  experience: string;
  clinicalExperience: string;
  userType: string;
  // isDeleted: boolean;
  // isActivated: boolean;
  // createdAt: Date;
  // updatedAt: Date;
  // emailVerification: Date;
}

export class OTP {
  otp_ascii: string;
  otp_auth_url: string;
  otp_base32: string;
  otp_hex: string;
}

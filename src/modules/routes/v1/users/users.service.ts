import * as speakeasy from 'speakeasy';

import {
  FindQuery,
  MongoDelete,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  OTP,
  Profile,
  UserProfileStatus,
  UserStatus,
} from './interfaces/user.interface';
import { User, UserDocument } from './schemas/users.schema';

import { ClientUnitsService } from '../clientUnits/clientUnits.service';
import PasswordService from './password.service';
import { Roles } from '../roles/constants/role.constant';
import RolesRepository from '../roles/roles.repository';
import UsersBusinessService from './business.service';
import UsersRepository from './users.repository';
import { json } from 'express';
import mongoose from 'mongoose';

@Injectable()
export default class UsersService implements OnModuleInit {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly usersBusinessService: UsersBusinessService,
    private readonly passwordService: PasswordService,
    private readonly clientUnitsService: ClientUnitsService,
  ) {}

  async onModuleInit() {
    // Find or create super admin role
    let superAdminRole = await this.rolesRepository.findOne({
      filter: { priority: Roles.SuperAdmin },
    });

    // If super admin role doesn't exist, we should handle this case
    if (!superAdminRole) {
      console.warn('Super Admin role not found. Please ensure roles are properly seeded.');
      return;
    }

    const profile: Profile = {
      countryId: '',
      clientUnitId: '',
      businessUnitId: '',
      lastName: '',
      firstName: '',
      status: UserProfileStatus.Approval,
      authCode: '',
      initial: '',
      title: '',
      experience: '',
      clinicalExperience: '',
      userType: '',
    };

    const otp: OTP = {
      otp_ascii: '',
      otp_auth_url: '',
      otp_base32: '',
      otp_hex: '',
    };

    const hashedPassword = await this.passwordService.hash('craa12!@');

    const adminUserDao: User = {
      email: 'superAdmin@hoansoft.com',
      aliasEmails: [],
      name: 'superAdmin',
      password: hashedPassword,
      roleId: superAdminRole._id,
      profile: profile,
      isDeleted: false,
      isActivated: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      status: new UserStatus(),
      emailVerification: undefined,
      otpData: otp,
      emailVerificationLink: '',
      passwordResetToken: '',
      authority: {
        pfizerAdmin: false,
        authorizedAll: true,
        publishNotification: false,
        distributionNotification: false,
        whitelist: [],
      },
      demoId: '',
      isDemo: false,
    };
    // @Joongwon 배열 리턴되는데 확인 필요
    const isSuperAdminExist: any = await this.usersRepository.getByEmail(
      'superAdmin@hoansoft.com',
    );

    if (isSuperAdminExist) {
      return console.info(`${isSuperAdminExist?.name} is Exist!`);
    }

    await this.usersRepository.create(adminUserDao);
  }

  public async activate(signUpUser: any) {
    try {
      const hashedPassword = await this.passwordService.hash(
        signUpUser.password as string,
      );

      const query = {
        filter: { email: signUpUser.email },
        update: {
          password: hashedPassword,
          emailVerification: new Date(),
          isActivated: true,
        },
      };
      await this.usersRepository.updateOne(query);
    } catch (error) {
      console.log(error);
    }
  }

  public async create(signUpUser: any) {
    try {
      // if user exist already, throw error and finish the progress.
      const isUserExist = await this.usersRepository.findOne({
        filter: { email: signUpUser.email, isDeleted: false },
      });
      if (isUserExist) {
        throw new HttpException(
          'There is a user registered with the same email.',
          HttpStatus.FORBIDDEN,
        );
      }
      // const isHashedPassword = await this.passwordService.isPlainPassword(
      //   signUpUser.password as string,
      // );
      // if (isHashedPassword) {
      //   throw new HttpException(
      //     'You can not use "$" in your password.',
      //     HttpStatus.FORBIDDEN,
      //   );
      // }

      const hashedPassword = await this.passwordService.hash(
        signUpUser.password as string,
      );

      const userProfile: Profile = signUpUser.profile;

      const clientUnit = await this.clientUnitsService.readClient(
        userProfile.clientUnitId,
      );

      const { clientUnitId, countryId } = userProfile;

      //NOTE - 하나의 clientUnit 아래의 businessUnit들은 모두 다른 나라를 갖는다
      const selectedBusinessUnit = clientUnit?.businessUnits.find(
        (_businessUnit) => _businessUnit.countryIds.includes(countryId),
      );
      userProfile.businessUnitId = selectedBusinessUnit?._id.toString() || '';
      const profile = {
        _id: new mongoose.Types.ObjectId(),
        ...userProfile,
        status: UserProfileStatus.Verified,
      };
      const userId = new mongoose.Types.ObjectId();

      const signupUser: Partial<User> = {
        _id: userId,
        email: signUpUser.email,
        name: signUpUser.name,
        password: hashedPassword,
        roleId: signUpUser.roleId,
        profile: profile,
        authority: signUpUser?.authority,
      };
      const user = await this.usersRepository.create(signupUser);
      try {
        const simUserRole = await this.rolesRepository.findOne({
          filter: { priority: 6 },
        });
        if (simUserRole._id.toString() === user.roleId) {
          await this.usersBusinessService.createUserAssessmentCycle({
            clientUnitId,
            businessUnit: selectedBusinessUnit,
            userId: userId.toString(),
            countryId,
          });
        }
      } catch (error) {
        console.log(error);
      }

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async findWithSearch(query: FindQuery<UserDocument>) {
    const users = await this.usersRepository.find(query);
    const searchString = query?.options?.fields?.searchString;
    if (searchString !== undefined) {
      return users.filter((_variable) => {
        if (
          _variable.name?.toLowerCase().includes(searchString.toLowerCase()) ||
          _variable.email?.toLowerCase().includes(searchString.toLowerCase())
        )
          return true;
        return false;
      });
    } else {
      return users;
    }
  }

  find(query: FindQuery<UserDocument>) {
    if (query.options?.multi) {
      return this.usersRepository.find(query);
    }
    return this.usersRepository.findOne(query);
  }

  async count(query: FindQuery<UserDocument>) {
    return this.usersRepository.count(query);
  }

  public getVerifiedUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getVerifiedUserByEmail(email);
  }

  public getVerifiedUserById(id: any): Promise<User | null> {
    return this.usersRepository.getVerifiedUserById(id);
  }

  public getUnverifiedUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.getUnverifiedUserByEmail(email);
  }

  public getUnverifiedUserById(id: any): Promise<User | null> {
    return this.usersRepository.getUnverifiedUserById(id);
  }

  public update(query: PatchBody<UserDocument>) {
    if (query.options?.multi) {
      return this.usersRepository.updateOne(query);
    }
    return this.usersRepository.updateMany(query);
  }

  public async updatePassword(_id: string, password: string) {
    const hashedPassword = await this.passwordService.hash(password);
    const query = {
      filter: {
        _id,
      },
      update: {
        $set: { password: hashedPassword, updatedAt: new Date() },
      },
    } as PatchBody<UserDocument>;
    return this.usersRepository.updateMany(query);
  }

  public async verifyOtp(user_id: string, token: string) {
    try {
      const user = await this.usersRepository.findOne({
        filter: {
          _id: user_id,
        },
      });
      const message = "Token is invalid or user doesn't exist";
      if (!user) {
        return {
          status: 'fail',
          message,
        };
      }

      const verified = speakeasy.totp.verify({
        secret: user.otpData.otp_base32!,
        encoding: 'base32',
        token,
      });

      if (!verified) {
        return {
          status: 'fail',
          message,
        };
      }

      const updatedUser = await this.usersRepository.updateOne({
        filter: {
          _id: user_id,
        },
        update: {
          'otpData.otp_enabled': true,
          'otpData.otp_verified': true,
        },
      });
      return {
        status: 'success',
      };
    } catch (error) {
      console.log(error);
    }
  }

  public async disableOtp(user_id: string) {
    try {
      const user = await this.usersRepository.findOne({
        filter: {
          _id: user_id,
        },
      });
      if (!user) {
        return {
          status: 'fail',
          message: "User doesn't exist",
        };
      }

      const updatedUser = await this.usersRepository.updateOne({
        filter: {
          _id: user_id,
        },
        update: {
          otpData: {},
        },
      });
      return {
        status: 'success',
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'fail',
      };
    }
  }

  public async generateOtp(user_id: string, email: string) {
    try {
      const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({
        issuer: 'https://craa-app-dev-3.hoansoft.com',
        name: email,
        length: 15,
      });

      await this.usersRepository.updateOne({
        filter: {
          _id: user_id,
        },
        update: {
          otpData: {
            otp_ascii: ascii,
            otp_auth_url: otpauth_url,
            otp_base32: base32,
            otp_hex: hex,
          },
        },
      });
      return {
        base32: base32,
        otpauth_url: otpauth_url,
      };
    } catch (error) {
      console.log(error);
    }
  }

  delete(query: MongoDelete<UserDocument>) {
    return this.usersRepository.deleteOne(query);
  }
}

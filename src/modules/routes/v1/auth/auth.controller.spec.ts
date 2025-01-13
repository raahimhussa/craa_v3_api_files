import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import  UsersService  from '../users/users.service';
import  AuthController  from './auth.controller';
import { MailerService } from '@nestjs-modules/mailer';
import { RolesService } from '../roles/roles.service';
import AuthService from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let mockUsersService;
  let mockJwtService;
  let authService: AuthService;

  beforeEach(async () => {
    mockUsersService = { getVerifiedUserByEmail: jest.fn() };
    mockJwtService = { sign: jest.fn() };
    // authService = ;

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        // { provide: authService, useValue: mockJwtService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should return correct message if user does not exist', async () => {
    mockUsersService.getVerifiedUserByEmail.mockResolvedValue(null);

    const result = await authController.requestPasswordReset({ email: 'nonexistent@test.com' });
    
    expect(result).toEqual({ success: false, message: 'User with that email does not exist' });
  });

  // it('should return correct message if user exists', async () => {
  //   const mockUser = { email: 'test@test.com', _id: '123' };
  //   mockUsersService.getVerifiedUserByEmail.mockResolvedValue(mockUser);
  //   mockJwtService.sign.mockReturnValue('test_token');

  //   const result = await authController.requestPasswordReset({ email: 'test@test.com' });

  //   expect(result).toEqual({ success: true, message: 'Password reset link has been sent to your email' });
  //   expect(mockJwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, id: mockUser._id });
  // });

  // more if needed
});

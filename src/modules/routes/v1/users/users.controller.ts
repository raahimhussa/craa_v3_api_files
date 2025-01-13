import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
  Delete,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FindQuery,
  PatchBody,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import UsersService from './users.service';
import { UserDocument } from './schemas/users.schema';
import JwtAccessGuard from 'src/common/guards/jwt-access.guard';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import UsersBusinessService from './business.service';
import { BusinessUnit } from '../clientUnits/schemas/clientUnit.schema';

@ApiTags('Users')
@ApiBearerAuth()
// @ApiExtraModels(User)
@Controller()
export default class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersBusinessService: UsersBusinessService,
  ) {}

  @Get('/count')
  async count(@Query(new parseQueryPipe()) query: FindQuery<UserDocument>) {
    return this.usersService.count(query);
  }
  // @ApiOkResponse({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         $ref: getSchemaPath(User),
  //       },
  //     },
  //   },
  //   description: '200. Success. Returns a user',
  // })
  // @ApiNotFoundResponse({ description: '404. NotFoundException. User was not found' })
  // @ApiUnauthorizedResponse({ description: '401. UnauthorizedException.' })
  // @ApiParam({ name: 'id', type: String })
  @Get(':id')
  // @Serialize(UserResponseEntity)
  @UseGuards(JwtAccessGuard)
  async getById(@Param('id') id: any) {
    const foundUser = await this.usersService.getVerifiedUserById(id);

    if (!foundUser) {
      throw new NotFoundException('The user does not exist');
    }

    return foundUser;
  }

  // @ApiOkResponse({ description: '200. Success. Returns all users' })
  // @ApiUnauthorizedResponse({ description: '401. UnauthorizedException.' })
  // @Get('verified')
  // // @Serialize(UserResponseEntity)
  // // @UseGuards(JwtAccessGuard)
  // async getAllVerifiedUsers(@Query() query: any) {
  //   const paginationParams: PaginationParamsInterface | false = PaginationUtils.normalizeParams(query.page);
  //   if (!paginationParams) {
  //     throw new BadRequestException('Invalid pagination parameters');
  //   }

  //   const paginatedUsers: PaginatedUsersInterface = await this.usersService.getAllVerifiedWithPagination(paginationParams);

  //   return ResponseUtils.success('users', paginatedUsers.paginatedResult, {
  //     location: 'users',
  //     paginationParams,
  //     totalCount: paginatedUsers.totalCount,
  //   });
  // }

  // @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<UserDocument>) {
    if (query?.options?.fields?.searchString) {
      return this.usersService.findWithSearch(query);
    } else {
      return this.usersService.find(query);
    }
  }

  @Patch()
  async update(@Body() body: PatchBody<UserDocument>) {
    return this.usersService.update(body);
  }

  @Patch('/password')
  async updatePassword(
    @Body() { _id, password }: { _id: string; password: string },
  ) {
    return this.usersService.updatePassword(_id, password);
  }

  @Post('/otp/generate')
  async generateOtp(
    @Body() { user_id, email }: { user_id: string; email: string },
  ) {
    return this.usersService.generateOtp(user_id, email);
  }
  @Post('/otp/verify')
  async verifyOtp(
    @Body() { user_id, token }: { user_id: string; token: string },
  ) {
    return this.usersService.verifyOtp(user_id, token);
  }
  @Post('/otp/disable')
  async disableOtp(@Body() { user_id }: { user_id: string }) {
    return this.usersService.disableOtp(user_id);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: MongoDelete<UserDocument>) {
    return this.usersService.delete(query);
  }

  @Post('addAssessmentCycle')
  async addAssessmentCycle(
    @Body()
    {
      clientUnitId,
      businessUnitId,
      businessCycleId,
      assessmentTypeId,
      userId,
      bypass,
      countryId,
    }: {
      clientUnitId: string;
      businessUnitId: string;
      businessCycleId: string;
      assessmentTypeId: string;
      userId: string;
      countryId: string;
      bypass: boolean;
    },
  ) {
    return this.usersBusinessService.createUserAssessmentCycleManually({
      clientUnitId,
      businessUnitId,
      businessCycleId,
      assessmentTypeId,
      userId,
      bypass,
      countryId,
    });
  }
}

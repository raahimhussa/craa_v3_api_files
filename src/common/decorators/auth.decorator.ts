import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import RolesGuard from '../guards/roles.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesEnum } from './roles.decorator';

export default function Auth(...roles: RolesEnum[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    // ApiBearerAuth(),
  );
}

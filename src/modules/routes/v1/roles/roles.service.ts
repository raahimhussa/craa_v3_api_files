import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Roles } from './constants/role.constant';
import CreateRoleDto from './dto/createRole.dto';
import RolesRepository from './roles.repository';
import { Role, RoleDocument } from './schemas/roles.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async onModuleInit() {
    await Promise.all(
      Object.entries(Roles).map(async ([title, priority]) => {
        const roleDao: Role = {
          title,
          priority,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const isRoleExist = await this.rolesRepository.findOne({
          filter: {
            title,
          },
        });
        if (isRoleExist) {
          return console.info(`${title} is Exist and not create`);
        }

        await this.rolesRepository.create(roleDao);
      }),
    );
  }

  create(createRoleDto: CreateRoleDto) {
    return this.rolesRepository.create(createRoleDto);
  }

  find(
    query: FindQuery<RoleDocument>,
  ): Promise<Role | null> | Promise<Role[] | null> {
    if (query.options?.multi) {
      return this.rolesRepository.find(query);
    }
    return this.rolesRepository.findOne(query);
  }

  update(
    body: PatchBody<RoleDocument>,
  ): Promise<Role | null> | Promise<Role[] | null> {
    if (body.options?.multi) {
      return this.rolesRepository.updateOne(body);
    }
    return this.rolesRepository.updateMany(body);
  }

  delete(query: DeleteQuery<RoleDocument>): Promise<Role | null> {
    return this.rolesRepository.deleteOne(query);
  }

  findById(roleId: string) {
    return this.rolesRepository.findById(roleId);
  }
}

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Role, RoleDocument } from './schemas/roles.schema';
import CreateRoleDto from './dto/createRole.dto';

@Injectable()
export default class RolesRepository {
  constructor(
    @InjectModel(Role.name) private rolesModel: Model<RoleDocument>,
  ) {}

  public async create(role: CreateRoleDto) {
    const newRole = await this.rolesModel.create({
      ...role,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newRole.toObject();
  }

  public async find(query: FindQuery<RoleDocument>): Promise<Role[] | null> {
    return this.rolesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: FindQuery<RoleDocument>): Promise<Role | null> {
    return this.rolesModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(body: PatchBody<RoleDocument>): Promise<Role | null> {
    await this.rolesModel.updateOne(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.rolesModel
      .updateOne(body.filter, body.update, body.options)
      .lean();
  }

  public async updateMany(
    body: PatchBody<RoleDocument>,
  ): Promise<Role[] | null> {
    await this.rolesModel.updateMany(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.rolesModel
      .updateMany(body.filter, body.update, body.options)
      .lean();
  }

  public async deleteOne(
    query: DeleteQuery<RoleDocument>,
  ): Promise<Role | null> {
    return this.rolesModel.deleteOne(query.filter, query.options).lean();
  }

  public async deleteMany(
    query: DeleteQuery<RoleDocument>,
  ): Promise<Role[] | null> {
    return this.rolesModel.deleteMany(query.filter, query.options).lean();
  }

  public async findById(roleId: any): Promise<Role[] | null> {
    return this.rolesModel.findById(roleId).lean();
  }
}

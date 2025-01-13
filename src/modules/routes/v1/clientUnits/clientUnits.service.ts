import {
  Authority,
  ClientUnitAuthority,
} from '../users/interfaces/user.interface';
import {
  BusinessCycleDto,
  BusinessUnitDto,
  ClientUnitDto,
} from './dto/clientUnit.dto';
import {
  BusinessUnit,
  ClientUnit,
  ClientUnitDocument,
} from './schemas/clientUnit.schema';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { QueryOptions } from 'mongoose';

import { AssessmentCycle } from '../assessmentCycles/assessmentCycle.schema';
import { AssessmentCyclesService } from '../assessmentCycles/assessmentCycles.service';
import { AssessmentType } from '../assessmentTypes/schemas/assessmentType.schema';
import AssessmentTypesService from '../assessmentTypes/assessmentTypes.service';
import ClientUnitsRepository from './clientUnits.repository';
import e from 'express';

@Injectable()
export class ClientUnitsService {
  constructor(
    private readonly clientUnitsRepository: ClientUnitsRepository,
    private readonly assessmentCyclesService: AssessmentCyclesService,
    private readonly assessmentTypesService: AssessmentTypesService,
  ) {}

  async createClient(clientUnitDto: ClientUnitDto) {
    const newClientUnit: any = await this.clientUnitsRepository.create({
      ...clientUnitDto,
      authCode: this.makeId(10),
      updatedAt: new Date(),
      createdAt: new Date(),
      isDeleted: false,
    });
    // const clientUnit = await this.clientUnitsRepository.findOne({
    //   filter: { authCode: newClientUnit.authCode },
    // });
    // const authDto = {
    //   text: clientUnit.authCode,
    //   clientUnitId: clientUnit._id,
    // };

    // await this.authCodesService.create(authDto);
    return newClientUnit;
  }

  async bulkCreate(clientUnitDtos: ClientUnitDto[]) {
    await this.clientUnitsRepository.bulkCreate(clientUnitDtos);
  }

  async createBusinessUnit(
    businessUnitDto: BusinessUnitDto,
    clientUnitId: string,
  ) {
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $push: {
          businessUnits: {
            ...businessUnitDto,
            _id: new mongoose.Types.ObjectId().toHexString(),
            businessCycles: businessUnitDto.businessCycles.map(
              (_businessCycle) => ({
                ..._businessCycle,
                _id: new mongoose.Types.ObjectId().toHexString(),
              }),
            ),
            updatedAt: new Date(),
            createdAt: new Date(),
            isDeleted: false,
          },
        },
      },
    });
  }
  async createBusinessCycle(
    businessCycleDto: BusinessCycleDto,
    clientUnitId: string,
    businessUnitId: string,
  ) {
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $set: {
          $push: {
            'businessUnits.$[businessUnit].businessCycles': {
              ...businessCycleDto,
              _id: new mongoose.Types.ObjectId().toHexString(),
              updatedAt: new Date(),
              createdAt: new Date(),
              isDeleted: false,
            },
          },
        },
      },
      options: {
        arrayFilters: [{ 'businessUnit._id': businessUnitId }],
      },
    });
  }

  async readAllClient(query: any) {
    try {
      const clientUnits = await this.clientUnitsRepository.find({
        filter:
          typeof query.filter === 'string' && query.filter
            ? JSON.parse(query.filter)
            : typeof query.filter === 'object'
            ? query.filter
            : undefined,
        options:
          typeof query.options === 'string' && query.options
            ? JSON.parse(query.options)
            : typeof query.options === 'object'
            ? query.options
            : undefined,
      });
      const assessmentTypes = (await this.assessmentTypesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentType[];
      const assessmentCycles = (await this.assessmentCyclesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentCycle[];
      clientUnits.forEach((_clientUnit) => {
        _clientUnit.businessUnits.forEach((_businessUnit) => {
          _businessUnit.businessCycles.forEach((_businessCycle: any) => {
            _businessCycle.assessmentCycle = assessmentCycles.find(
              (_assessmentCycle) =>
                _assessmentCycle._id.toString() ===
                _businessCycle.assessmentCycleId,
            );
            if (_businessCycle.assessmentCycle !== undefined) {
              _businessCycle.assessmentCycle.assessmentTypes =
                assessmentTypes.filter((_assessmentType) =>
                  _businessCycle?.assessmentCycle?.assessmentTypeIds?.includes(
                    _assessmentType._id.toString(),
                  ),
                );
            }
          });
        });
      });
      return clientUnits;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async readVendors(clientUnitId: string) {
    try {
      const clientUnits = await this.clientUnitsRepository.find({
        filter: {
          vendor: clientUnitId,
          isDeleted: false,
        },
      });
      const assessmentTypes = (await this.assessmentTypesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentType[];
      const assessmentCycles = (await this.assessmentCyclesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentCycle[];
      clientUnits.forEach((_clientUnit) => {
        _clientUnit.businessUnits.forEach((_businessUnit) => {
          _businessUnit.businessCycles.forEach((_businessCycle: any) => {
            _businessCycle.assessmentCycle = assessmentCycles.find(
              (_assessmentCycle) =>
                _assessmentCycle._id.toString() ===
                _businessCycle.assessmentCycleId,
            );
            _businessCycle.assessmentCycle.assessmentTypes =
              assessmentTypes.filter((_assessmentType) =>
                _businessCycle?.assessmentCycle?.assessmentTypeIds?.includes(
                  _assessmentType._id.toString(),
                ),
              );
          });
        });
      });
      return clientUnits;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  async countAllClient() {
    return await this.clientUnitsRepository.count({
      filter: {
        isDeleted: false,
        vendor: { $eq: '' },
      },
    });
  }

  async readFilteredClient(authority: Authority) {
    const whitelist = authority.whitelist;
    try {
      const clientUnits = await this.clientUnitsRepository.find({
        filter: {
          isDeleted: false,
          _id: {
            $in:
              whitelist?.map((_wl: any) => {
                return JSON.parse(_wl).clientId;
              }) || [],
          },
        },
      });
      const assessmentTypes = (await this.assessmentTypesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentType[];
      const assessmentCycles = (await this.assessmentCyclesService.find({
        filter: { isDeleted: false },
        options: { multi: true },
      })) as AssessmentCycle[];
      clientUnits.forEach((_clientUnit) => {
        _clientUnit.businessUnits.forEach((_businessUnit) => {
          _businessUnit.businessCycles.forEach((_businessCycle: any) => {
            _businessCycle.assessmentCycle = assessmentCycles.find(
              (_assessmentCycle) =>
                _assessmentCycle._id.toString() ===
                _businessCycle.assessmentCycleId,
            );
            _businessCycle.assessmentCycle.assessmentTypes =
              assessmentTypes.filter((_assessmentType) =>
                _businessCycle?.assessmentCycle?.assessmentTypeIds?.includes(
                  _assessmentType._id.toString(),
                ),
              );
          });
        });
      });
      const ret: any = [];
      clientUnits.forEach((_clientUnit) => {
        const whitelistClient = whitelist.find((_wl: any) => {
          return JSON.parse(_wl).clientId === _clientUnit._id.toString();
        });
        const c_ret: any = { ..._clientUnit, businessUnits: [] };
        _clientUnit.businessUnits.forEach((_businessUnit) => {
          if (
            JSON.parse(whitelistClient as any).businessUnits.includes(
              _businessUnit._id.toString(),
            )
          ) {
            c_ret.businessUnits.push(_businessUnit);
          }
        });
        ret.push(c_ret);
      });
      return ret;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async readClient(clientUnitId: string) {
    if (!clientUnitId) return null;
    return await this.clientUnitsRepository.findOne({
      filter: { _id: clientUnitId },
    });
  }
  async readBusinessUnit(clientUnitId: string, businessUnitId: string) {
    if (!clientUnitId || !businessUnitId) return null;
    const clientUnit = await this.clientUnitsRepository.findOne({
      filter: { _id: clientUnitId },
    });
    return clientUnit?.businessUnits.find(
      (_businessUnit) => _businessUnit._id.toString() === businessUnitId,
    );
  }
  async readBusinessCycle(
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
  ) {
    if (!clientUnitId || !businessUnitId || !businessCycleId) return null;
    const clientUnit = await this.clientUnitsRepository.findOne({
      filter: { _id: clientUnitId },
    });

    return clientUnit?.businessUnits
      .find((_businessUnit) => _businessUnit._id.toString() === businessUnitId)
      ?.businessCycles.find(
        (_businessCycle) => _businessCycle._id.toString() === businessCycleId,
      );
  }

  async updateClient(clientUnitDto: ClientUnitDto, clientUnitId: string) {
    if (!clientUnitId) return null;
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $set: clientUnitDto,
      },
    });
  }
  async updateBusinessUnit(
    businessUnitDto: BusinessUnitDto,
    clientUnitId: string,
    businessUnitId: string,
  ) {
    if (!clientUnitId || !businessUnitId) return null;
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $set: {
          'businessUnits.$[businessUnit]': {
            ...businessUnitDto,
            _id: new mongoose.Types.ObjectId(businessUnitId).toHexString(),
            businessCycles: businessUnitDto.businessCycles.map(
              (_businessCycle) => ({
                ..._businessCycle,
                _id: _businessCycle._id
                  ? new mongoose.Types.ObjectId(
                      _businessCycle._id.toString(),
                    ).toHexString()
                  : new mongoose.Types.ObjectId().toHexString(),
              }),
            ),
          },
        },
      },
      options: {
        arrayFilters: [
          {
            'businessUnit._id': {
              $eq: new mongoose.Types.ObjectId(businessUnitId).toHexString(),
            },
          },
        ],
      },
    });
  }
  async updateBusinessCycle(
    businessCycleDto: BusinessCycleDto,
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
  ) {
    if (!clientUnitId || !businessUnitId || !businessCycleId) return null;
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $set: {
          'businessUnits.$[businessUnit].businessCycles.$[businessCycle]': {
            ...businessCycleDto,
            _id: new mongoose.Types.ObjectId(businessCycleId).toHexString(),
          },
        },
      },
      options: {
        arrayFilters: [
          {
            'businessUnit._id': {
              $eq: new mongoose.Types.ObjectId(businessUnitId).toHexString(),
            },
          },
          {
            'businessCycle._id': {
              $eq: new mongoose.Types.ObjectId(businessCycleId).toHexString(),
            },
          },
        ],
      },
    });
  }

  // async updateClientUnitScreenRecording (clientUnitId: string, toggle:boolean) {
  //   if (!clientUnitId) return null;
  //   await this.clientUnitsRepository.updateOne({
  //     filter: { _id: clientUnitId },
  //     update: {
  //       $set: {
  //         isScreenRecordingOn: toggle
  //       },
  //     },
  //   });
  // }

  async deleteClient(clientUnitId: string) {
    if (!clientUnitId) return null;
    await this.clientUnitsRepository.deleteOne({
      filter: { _id: clientUnitId },
    });
  }
  async deleteBusinessUnit(clientUnitId: string, businessUnitId: string) {
    if (!clientUnitId || !businessUnitId) return null;

    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $pull: {
          businessUnits: {
            _id: new mongoose.Types.ObjectId(businessUnitId).toHexString(),
          },
        },
      },
    });
  }
  async deleteBusinessCycle(
    clientUnitId: string,
    businessUnitId: string,
    businessCycleId: string,
  ) {
    if (!clientUnitId || !businessUnitId || !businessCycleId) return null;
    await this.clientUnitsRepository.updateOne({
      filter: { _id: clientUnitId },
      update: {
        $pull: {
          'businessUnits.$[businessUnit].businessCycles': {
            _id: businessCycleId,
          },
        },
      },
      options: {
        arrayFilters: [
          {
            'businessUnit._id': {
              $eq: new mongoose.Types.ObjectId(businessUnitId).toHexString(),
            },
          },
        ],
      },
    });
  }

  async verifyAuthCode(authCode: string) {
    const query = {
      filter: { authCode },
    };

    const clientUnitDoc = await this.clientUnitsRepository.findOne(query);

    if (!clientUnitDoc) {
      throw new NotFoundException();
    }
    return { clientUnitId: clientUnitDoc._id };
  }

  makeId(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  find(query: FindQuery<ClientUnitDocument>) {
    if (query.options?.multi) {
      return this.clientUnitsRepository.find(query);
    }
    return this.clientUnitsRepository.findOne(query);
  }

  findById(clientUnitId: any) {
    return this.clientUnitsRepository.findById(clientUnitId);
  }

  update(body: PatchBody<ClientUnitDocument>) {
    return this.clientUnitsRepository.updateMany(body);
  }

  delete(query: DeleteQuery<ClientUnitDocument>) {
    return this.clientUnitsRepository.deleteMany(query);
  }
}

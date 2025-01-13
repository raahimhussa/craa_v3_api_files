import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Agreement, AgreementDocument } from './schemas/agreement.schema';
import AgreementDto from './dto/agreement.dto';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

@Injectable()
export default class AgreementsRepository {
  constructor(
    @InjectModel(Agreement.name)
    private agreementModel: Model<AgreementDocument>,
  ) {}

  public async create(agreement: AgreementDto): Promise<Agreement | null> {
    const newAgreement = await this.agreementModel.create(agreement);
    return newAgreement.toObject();
  }

  public async find(query: MongoQuery<Agreement>): Promise<Agreement[] | null> {
    const { filter, projection, options } = query;
    return this.agreementModel.find(filter, projection, options).lean();
  }

  public async findOne(
    query: MongoQuery<Agreement>,
  ): Promise<Agreement | null> {
    const { filter, projection, options } = query;
    return this.agreementModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(
    body: MongoUpdate<Agreement>,
  ): Promise<Agreement | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.agreementModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<Agreement>,
  ): Promise<Agreement[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.agreementModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<Agreement>,
  ): Promise<Agreement | null> {
    const { filter, options } = query;
    return this.agreementModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<Agreement>,
  ): Promise<Agreement[] | null> {
    const { filter, options } = query;
    return this.agreementModel.deleteMany(filter, options).lean();
  }
}

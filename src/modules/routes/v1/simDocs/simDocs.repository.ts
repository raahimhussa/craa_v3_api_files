import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { SimDoc } from './schemas/simDoc.schema';
import SimDocDto from './dto/simDoc.dto';

@Injectable()
export default class SimDocsRepository {
  constructor(@InjectModel(SimDoc.name) private simDocModel: Model<SimDoc>) {}

  public async create(simDoc: SimDocDto): Promise<SimDoc | null> {
    const simDocCount = await this.simDocModel.find({}).count();
    if (simDoc.folderId) {
      const simDocCountByFolder = await this.simDocModel
        .find({
          folderId: simDoc.folderId,
        })
        .count();

      const newSimDoc = await this.simDocModel.create({
        ...simDoc,
        visibleId: simDocCount + 1, //-- double-check if this is correct
        seq: simDocCountByFolder,
      });
      return newSimDoc.toObject();
    }
    const newSimDoc = await this.simDocModel.create({
      ...simDoc,
      visibleId: simDocCount,
    });
    return newSimDoc.toObject();
  }

  public async bulkDemoCreate(simDocs: SimDocDto[]) {
    await this.simDocModel.insertMany(simDocs);
  }

  public async findCount(query: MongoQuery<SimDoc>) {
    const { filter, projection, options } = query;
    return this.simDocModel.find(filter, projection, options).count();
  }

  public async find(query: MongoQuery<SimDoc>): Promise<SimDoc[] | null> {
    const { filter, projection, options } = query;
    return this.simDocModel.find(filter, projection, options).lean();
  }

  public async findOne(query: MongoQuery<SimDoc>): Promise<SimDoc | null> {
    const { filter, projection, options } = query;
    return this.simDocModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(body: MongoUpdate<SimDoc>): Promise<SimDoc | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.simDocModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(body: MongoUpdate<SimDoc>): Promise<SimDoc[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.simDocModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(query: MongoDelete<SimDoc>): Promise<SimDoc | null> {
    const { filter, options } = query;
    return this.simDocModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<SimDoc>,
  ): Promise<SimDoc[] | null> {
    const { filter, options } = query;
    return this.simDocModel.deleteMany(filter, options).lean();
  }
}

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Page } from './schemas/page.schema';
import PageDto from './dto/page.dto';

@Injectable()
export default class PagesRepository {
  constructor(@InjectModel(Page.name) private pageModel: Model<Page>) {}

  public async create(page: PageDto): Promise<Page | null> {
    const newPage = await this.pageModel.create(page);
    return newPage.toObject();
  }

  public async find(query: MongoQuery<Page>): Promise<Page[] | null> {
    const { filter, projection, options } = query;
    return this.pageModel.find(filter, projection, options).lean();
  }

  public async findOne(query: MongoQuery<Page>): Promise<Page | null> {
    const { filter, projection, options } = query;
    return this.pageModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(body: MongoUpdate<Page>): Promise<Page | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.pageModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(body: MongoUpdate<Page>): Promise<Page[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.pageModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(query: MongoDelete<Page>): Promise<Page | null> {
    const { filter, options } = query;
    return this.pageModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(query: MongoDelete<Page>): Promise<Page[] | null> {
    const { filter, options } = query;
    return this.pageModel.deleteMany(filter, options).lean();
  }
}

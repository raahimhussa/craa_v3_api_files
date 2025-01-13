import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Viewport, ViewportDocument } from './schemas/viewport.schema';
import ViewportDto from './dto/viewport.dto';

@Injectable()
export default class ViewportsRepository {
  constructor(
    @InjectModel(Viewport.name) private viewportModel: Model<ViewportDocument>,
  ) {}

  public async create(viewport: ViewportDto): Promise<Viewport | null> {
    const newViewport = await this.viewportModel.create(viewport);
    return newViewport.toObject();
  }

  public async find(query: MongoQuery<Viewport>): Promise<Viewport[] | null> {
    return this.viewportModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Viewport>): Promise<Viewport | null> {
    return this.viewportModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Viewport | null> {
    return this.viewportModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Viewport>): Promise<Viewport | null> {
    const { filter, update, options } = body;

    return this.viewportModel
      .updateMany(
        filter,
        {
          ...update,
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
  }

  public async deleteMany(
    query: MongoDelete<Viewport>,
  ): Promise<Viewport[] | null> {
    const { filter, options } = query;
    return this.viewportModel.deleteMany(filter, options).lean();
  }
}

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import {
  ScreenRecorder,
  ScreenRecorderDocument,
} from './schemas/screenRecorder.schema';
import ScreenRecorderDto from './dto/screenRecorder.dto';

@Injectable()
export default class ScreenRecordersRepository {
  constructor(
    @InjectModel(ScreenRecorder.name)
    private screenRecorderModel: Model<ScreenRecorderDocument>,
  ) {}

  public async create(
    screenRecorder: ScreenRecorderDto,
  ): Promise<ScreenRecorder | null> {
    const newScreenRecorder = await this.screenRecorderModel.create(
      screenRecorder,
    );
    return newScreenRecorder.toObject();
  }

  public async find(
    query: MongoQuery<ScreenRecorder>,
  ): Promise<ScreenRecorder[] | null> {
    return this.screenRecorderModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(
    query: MongoQuery<ScreenRecorder>,
  ): Promise<ScreenRecorder | null> {
    return this.screenRecorderModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<ScreenRecorder | null> {
    return this.screenRecorderModel.findById(id).lean();
  }

  public async updateUniq(
    body: MongoUpdate<ScreenRecorder>,
    recorders: any,
  ): Promise<ScreenRecorder | null> {
    const { filter, update, options } = body;
    return this.screenRecorderModel
      .update(
        filter,
        {
          recorders: recorders,
        },
        options,
      )
      .lean();
  }

  public async update(
    body: MongoUpdate<ScreenRecorder>,
  ): Promise<ScreenRecorder | null> {
    const { filter, update, options } = body;
    return this.screenRecorderModel
      .update(
        filter,
        {
          $addToSet: {
            ...update,
          },
          updatedAt: Date.now(),
        },
        options,
      )
      .lean();
    // return this.screenRecorderModel
    //   .updateMany(
    //     filter,
    //     {
    //       ...update,
    //       updatedAt: Date.now(),
    //     },
    //     options,
    //   )
    //   .lean();
  }

  public async deleteMany(
    query: MongoDelete<ScreenRecorder>,
  ): Promise<ScreenRecorder[] | null> {
    const { filter, options } = query;
    return this.screenRecorderModel.deleteMany(filter, options).lean();
  }
}

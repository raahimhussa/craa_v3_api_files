import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Video, VideoDocument } from './schemas/video.schema';
import VideoDto from './dto/video';

@Injectable()
export default class VideosRepository {
  constructor(
    @InjectModel(Video.name) private quizModel: Model<VideoDocument>,
  ) {}

  public async create(dog: VideoDto): Promise<Video | null> {
    const newDog = await this.quizModel.create(dog);
    return newDog.toObject();
  }

  public async find(query: MongoQuery<Video>): Promise<Video[] | null> {
    return this.quizModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Video>): Promise<Video | null> {
    return this.quizModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Video | null> {
    return this.quizModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Video>): Promise<Video | null> {
    const { filter, update, options } = body;

    return this.quizModel
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

  public async deleteMany(query: MongoDelete<Video>): Promise<Video[] | null> {
    const { filter, options } = query;
    return this.quizModel.deleteMany(filter, options).lean();
  }

  public async deleteOne(quizId: string): Promise<Video[] | null> {
    const filter = { _id: quizId };
    const options = {};
    return this.quizModel.deleteOne(filter, options).lean();
  }
}

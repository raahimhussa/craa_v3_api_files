import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Injectable } from '@nestjs/common';
import { Video } from './schemas/video.schema';
import VideoDto from './dto/video';
import VideosRepository from './video.repository';

@Injectable()
export default class VideosService {
  constructor(private readonly quizzesRepository: VideosRepository) {}

  public async create(quiz: VideoDto): Promise<Video | null> {
    return this.quizzesRepository.create(quiz);
  }

  public async find(query: MongoQuery<Video>): Promise<Video[] | null> {
    return this.quizzesRepository.find(query);
  }

  public async findOne(query: MongoQuery<Video>): Promise<Video | null> {
    return this.quizzesRepository.findOne(query);
  }

  public async findById(id: string): Promise<Video | null> {
    return this.quizzesRepository.findById(id);
  }

  public async update(quiz: Video): Promise<Video | null> {
    const body: MongoUpdate<Video> = {
      filter: { _id: quiz._id },
      update: quiz,
    };
    return this.quizzesRepository.update(body);
  }

  public async delete(query: MongoDelete<Video>): Promise<Video[] | null> {
    return this.quizzesRepository.deleteMany(query);
  }

  public async deleteOne(quizId: string): Promise<Video[] | null> {
    return this.quizzesRepository.deleteOne(quizId);
  }
}

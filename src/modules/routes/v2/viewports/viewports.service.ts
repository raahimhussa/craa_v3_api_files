import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import ViewportDto from './dto/viewport.dto';
import ViewportsRepository from './viewports.repository';
import { Viewport } from './schemas/viewport.schema';

@Injectable()
export default class ViewportsService {
  constructor(private readonly viewportsRepository: ViewportsRepository) {}

  public async create(viewport: ViewportDto): Promise<Viewport | null> {
    return this.viewportsRepository.create(viewport);
  }

  public async find(query: MongoQuery<Viewport>): Promise<Viewport[] | null> {
    return this.viewportsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Viewport>): Promise<Viewport | null> {
    return this.viewportsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Viewport | null> {
    return this.viewportsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Viewport>): Promise<Viewport | null> {
    return this.viewportsRepository.update(body);
  }

  public async delete(
    query: MongoDelete<Viewport>,
  ): Promise<Viewport[] | null> {
    return this.viewportsRepository.deleteMany(query);
  }
}

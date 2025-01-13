import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Template, TemplateDocument } from './schemas/template.schema';
import TemplateDto from './dto/template.dto';

@Injectable()
export default class TemplatesRepository {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  public async create(template: TemplateDto): Promise<Template | null> {
    const newTemplate = await this.templateModel.create(template);
    return newTemplate.toObject();
  }

  public async find(
    query: MongoQuery<TemplateDocument>,
  ): Promise<Template[] | null> {
    const { filter, projection, options } = query;
    return this.templateModel.find(filter, projection, options).lean();
  }

  public async findOne(
    query: MongoQuery<TemplateDocument>,
  ): Promise<Template | null> {
    const { filter, projection, options } = query;
    return this.templateModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(
    body: MongoUpdate<TemplateDocument>,
  ): Promise<Template | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.templateModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<TemplateDocument>,
  ): Promise<Template[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.templateModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<TemplateDocument>,
  ): Promise<Template | null> {
    const { filter, options } = query;
    return this.templateModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<TemplateDocument>,
  ): Promise<Template[] | null> {
    const { filter, options } = query;
    return this.templateModel.deleteMany(filter, options).lean();
  }
}

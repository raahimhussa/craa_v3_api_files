import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Category, CategoryDocument } from './schemas/category';
import CategoryDto from './dto/category.dto';

@Injectable()
export default class CategoriesRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  public async create(category: CategoryDto): Promise<Category | null> {
    const newCategory = await this.categoryModel.create(category);
    return newCategory.toObject();
  }

  public async find(
    query: MongoQuery<CategoryDocument>,
  ): Promise<Category[] | null> {
    const { filter, projection, options } = query;
    return this.categoryModel.find(filter, projection, options).lean();
  }

  public async findOne(
    query: MongoQuery<CategoryDocument>,
  ): Promise<Category | null> {
    const { filter, projection, options } = query;
    return this.categoryModel.findOne(filter, projection, options).lean();
  }

  public async updateOne(
    body: MongoUpdate<CategoryDocument>,
  ): Promise<Category | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };
    return this.categoryModel.updateOne(filter, _update, options).lean();
  }

  public async updateMany(
    body: MongoUpdate<CategoryDocument>,
  ): Promise<Category[] | null> {
    const { filter, update, options } = body;
    const _update = {
      ...update,
      updatedAt: Date.now(),
    };

    return this.categoryModel.updateMany(filter, _update, options).lean();
  }

  public async deleteOne(
    query: MongoDelete<CategoryDocument>,
  ): Promise<Category | null> {
    const { filter, options } = query;
    return this.categoryModel.deleteOne(filter, options).lean();
  }

  public async deleteMany(
    query: MongoDelete<CategoryDocument>,
  ): Promise<Category[] | null> {
    const { filter, options } = query;
    return this.categoryModel.deleteMany(filter, options).lean();
  }
}

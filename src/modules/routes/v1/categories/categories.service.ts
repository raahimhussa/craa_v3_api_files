import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import CategoryDto from './dto/category.dto';
import CategoriesRepository from './categories.repository';
import { Category, CategoryDocument } from './schemas/category';

@Injectable()
export default class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(Category: CategoryDto): Promise<Category | null> {
    return this.categoriesRepository.create(Category);
  }

  find(
    query: MongoQuery<Category>,
  ): Promise<Category | null> | Promise<Category[] | null> {
    const multi: boolean | undefined = query.options?.multi;

    if (!multi) {
      return this.categoriesRepository.findOne(query);
    }
    return this.categoriesRepository.find(query);
  }

  update(body: MongoUpdate<CategoryDocument>) {
    if (body.options?.multi) {
      return this.categoriesRepository.updateOne(body);
    }
    return this.categoriesRepository.updateMany(body);
  }

  delete(query: MongoDelete<CategoryDocument>) {
    return this.categoriesRepository.deleteOne(query);
  }
}

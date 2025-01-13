import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import CategoryDto from './dto/category.dto';
import { Category, CategoryDocument } from './schemas/category';
import CategoriesService from './categories.service';

@ApiTags('Categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() category: CategoryDto): Promise<Category | null> {
    return this.categoriesService.create(category);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<CategoryDocument>) {
    return this.categoriesService.find(query);
  }

  // @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<CategoryDocument>) {
    return this.categoriesService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<CategoryDocument>,
  ) {
    return this.categoriesService.delete(query);
  }
}

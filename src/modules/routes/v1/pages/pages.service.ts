import * as tmp from 'tmp';

import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Page, PageDocument } from './schemas/page.schema';

import FoldersService from '../../v2/folders/folders.service';
import PageDto from './dto/page.dto';
import PagesRepository from './pages.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class PagesService {
  constructor(
    private readonly pagesRepository: PagesRepository,
    private readonly foldersService: FoldersService,
  ) {}

  create(page: PageDto): Promise<Page | null> {
    return this.pagesRepository.create(page);
  }

  find(query: MongoQuery<Page>): Promise<Page[] | null> {
    return this.pagesRepository.find(query);
  }

  update(body: MongoUpdate<PageDocument>) {
    if (body.options?.multi) {
      return this.pagesRepository.updateOne(body);
    }
    return this.pagesRepository.updateMany(body);
  }

  delete(query: MongoDelete<PageDocument>) {
    return this.pagesRepository.deleteOne(query);
  }
}

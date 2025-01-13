import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import BookmarkDto from './dto/bookmark.dto';
import BookmarksRepository from './bookmarks.repository';
import { Bookmark } from './schemas/bookmark.schema';

@Injectable()
export default class BookmarksService {
  constructor(private readonly bookmarksRepository: BookmarksRepository) {}

  public async create(bookmark: BookmarkDto): Promise<Bookmark | null> {
    return this.bookmarksRepository.create(bookmark);
  }

  public async find(query: MongoQuery<Bookmark>): Promise<Bookmark[] | null> {
    return this.bookmarksRepository.find(query);
  }

  public async findOne(query: MongoQuery<Bookmark>): Promise<Bookmark | null> {
    return this.bookmarksRepository.findOne(query);
  }

  public async findById(id: string): Promise<Bookmark | null> {
    return this.bookmarksRepository.findById(id);
  }

  public async update(body: MongoUpdate<Bookmark>): Promise<Bookmark | null> {
    return this.bookmarksRepository.update(body);
  }

  public async delete(
    query: MongoDelete<Bookmark>,
  ): Promise<Bookmark[] | null> {
    return this.bookmarksRepository.deleteMany(query);
  }
}

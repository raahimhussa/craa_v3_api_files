import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import BookmarkDto from './dto/bookmark.dto';

@Injectable()
export default class BookmarksRepository {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
  ) {}

  public async create(bookmark: BookmarkDto): Promise<Bookmark | null> {
    const newBookmark = await this.bookmarkModel.create(bookmark);
    return newBookmark.toObject();
  }

  public async find(query: MongoQuery<Bookmark>): Promise<Bookmark[] | null> {
    return this.bookmarkModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Bookmark>): Promise<Bookmark | null> {
    return this.bookmarkModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Bookmark | null> {
    return this.bookmarkModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Bookmark>): Promise<Bookmark | null> {
    const { filter, update, options } = body;

    return this.bookmarkModel
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

  public async deleteMany(
    query: MongoDelete<Bookmark>,
  ): Promise<Bookmark[] | null> {
    const { filter, options } = query;
    return this.bookmarkModel.deleteMany(filter, options).lean();
  }
}

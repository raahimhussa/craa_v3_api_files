import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import VendorDto from './dto/vendor.dto';

@Injectable()
export default class VendorsRepository {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  public async create(vendor: VendorDto): Promise<Vendor | null> {
    const newVendor = await this.vendorModel.create(vendor);
    return newVendor.toObject();
  }

  public async find(query: MongoQuery<Vendor>): Promise<Vendor[] | null> {
    return this.vendorModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: MongoQuery<Vendor>): Promise<Vendor | null> {
    return this.vendorModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async findById(id: string): Promise<Vendor | null> {
    return this.vendorModel.findById(id).lean();
  }

  public async update(body: MongoUpdate<Vendor>): Promise<Vendor | null> {
    const { filter, update, options } = body;

    return this.vendorModel
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
    query: MongoDelete<Vendor>,
  ): Promise<Vendor[] | null> {
    const { filter, options } = query;
    return this.vendorModel.deleteMany(filter, options).lean();
  }
}

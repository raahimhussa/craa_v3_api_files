import { Injectable } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import VendorDto from './dto/vendor.dto';
import VendorsRepository from './vendors.repository';
import { Vendor } from './schemas/vendor.schema';

@Injectable()
export default class VendorsService {
  constructor(private readonly vendorsRepository: VendorsRepository) {}

  public async create(vendor: VendorDto): Promise<Vendor | null> {
    return this.vendorsRepository.create(vendor);
  }

  public async find(query: MongoQuery<Vendor>): Promise<Vendor[] | null> {
    return this.vendorsRepository.find(query);
  }

  public async findOne(query: MongoQuery<Vendor>): Promise<Vendor | null> {
    return this.vendorsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Vendor | null> {
    return this.vendorsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Vendor>): Promise<Vendor | null> {
    return this.vendorsRepository.update(body);
  }

  public async delete(query: MongoDelete<Vendor>): Promise<Vendor[] | null> {
    return this.vendorsRepository.deleteMany(query);
  }
}

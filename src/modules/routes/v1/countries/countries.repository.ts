import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { Country, CountryDocument } from './schemas/countries.schema';
import CreateCountryDto from './dto/createCountry.dto';

@Injectable()
export default class CountriesRepository {
  constructor(
    @InjectModel(Country.name) private countriesModel: Model<CountryDocument>,
  ) {}

  public async create(profile: CreateCountryDto) {
    const newCountry = await this.countriesModel.create({
      ...profile,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    return newCountry.toObject();
  }

  public async insertMany(documents: Array<any>) {
    await this.countriesModel.insertMany(documents);
  }

  public async getCount() {
    return await this.countriesModel.count();
  }

  public async find(query: FindQuery<Country>): Promise<Country[] | null> {
    return this.countriesModel
      .find(query.filter, query.projection, query.options)
      .lean();
  }

  public async findOne(query: FindQuery<Country>): Promise<Country | null> {
    return this.countriesModel
      .findOne(query.filter, query.projection, query.options)
      .lean();
  }

  public async updateOne(body: PatchBody<Country>): Promise<Country | null> {
    await this.countriesModel.updateOne(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.countriesModel
      .updateOne(body.filter, body.update, body.options)
      .lean();
  }

  public async updateMany(body: PatchBody<Country>): Promise<Country[] | null> {
    await this.countriesModel.updateMany(body.filter, {
      $set: { updatedAt: new Date() },
    });

    return this.countriesModel
      .updateMany(body.filter, body.update, body.options)
      .lean();
  }

  public async deleteOne(query: DeleteQuery<Country>): Promise<Country | null> {
    return this.countriesModel.deleteOne(query.filter, query.options).lean();
  }

  public async deleteMany(
    query: DeleteQuery<Country>,
  ): Promise<Country[] | null> {
    return this.countriesModel.deleteMany(query.filter, query.options).lean();
  }
}

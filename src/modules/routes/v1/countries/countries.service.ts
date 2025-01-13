import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DeleteQuery,
  FindQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import CreateCountryDto from './dto/createCountry.dto';
import CountriesRepository from './countries.repository';
import { CountryDocument } from './schemas/countries.schema';
import countries from './countries';

@Injectable()
export class CountriesService implements OnModuleInit {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async onModuleInit() {
    const count = await this.countriesRepository.getCount();
    if (count > 0) {
      console.info(
        'Countries is already initialized!!! and Skip Initialization!',
      );
      return null;
    }

    this.countriesRepository.insertMany(countries);
  }

  create(createCountryDto: CreateCountryDto) {
    return this.countriesRepository.create(createCountryDto);
  }

  find(query: FindQuery<CountryDocument>) {
    if (query.options?.multi) {
      return this.countriesRepository.find(query);
    }
    return this.countriesRepository.findOne(query);
  }

  update(body: PatchBody<CountryDocument>) {
    if (body.options?.multi) {
      return this.countriesRepository.updateOne(body);
    }
    return this.countriesRepository.updateMany(body);
  }

  delete(query: DeleteQuery<CountryDocument>) {
    return this.countriesRepository.deleteOne(query);
  }
}

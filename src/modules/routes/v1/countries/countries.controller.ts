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
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import CreateCountryDto from './dto/createCountry.dto';
import { CountriesService } from './countries.service';
import { CountryDocument } from './schemas/countries.schema';

@ApiTags('Countries')
@Controller()
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<CountryDocument>) {
    return this.countriesService.find(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<CountryDocument>) {
    return this.countriesService.update(body);
  }

  @ApiQuery({})
  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: DeleteQuery<CountryDocument>,
  ) {
    return this.countriesService.delete(query);
  }
}

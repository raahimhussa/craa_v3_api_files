import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  MongoQuery,
  MongoUpdate,
  MongoDelete,
} from 'src/common/interfaces/mongoose.entity';
import parseQueryPipe from 'src/common/pipes/parseQueryPipe';
import { Vendor } from './schemas/vendor.schema';
import VendorDto from './dto/vendor.dto';
import VendorsService from './vendors.service';

@ApiTags('Vendors')
@Controller()
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @ApiBody({ type: VendorDto })
  @Post()
  async create(@Body() vendor: VendorDto): Promise<Vendor | null> {
    return this.vendorsService.create(vendor);
  }

  @ApiQuery({})
  @Get()
  async find(@Query(new parseQueryPipe()) query: MongoQuery<Vendor>) {
    return this.vendorsService.find(query);
  }

  @ApiQuery({})
  @Get(':vendorId')
  async findOne(
    @Param('vendorId') vendorId: string,
    @Query(new parseQueryPipe()) query: MongoQuery<Vendor>,
  ) {
    if (vendorId === 'custom') return this.vendorsService.findOne(query);

    return this.vendorsService.findById(vendorId);
  }

  @ApiBody({})
  @Patch()
  async update(@Body() body: MongoUpdate<Vendor>): Promise<Vendor | null> {
    return this.vendorsService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: MongoDelete<Vendor>,
  ): Promise<Vendor[] | null> {
    return this.vendorsService.delete(query);
  }
}

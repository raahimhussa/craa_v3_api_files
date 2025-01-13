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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  PatchBody,
  FindQuery,
  DeleteQuery,
} from 'src/common/interfaces/mongoose.entity';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import {
  ClientUnitDto,
  BusinessUnitDto,
  BusinessCycleDto,
} from './dto/clientUnit.dto';
import { ClientUnitsService } from './clientUnits.service';
import { ClientUnit, ClientUnitDocument } from './schemas/clientUnit.schema';
import {
  Authority,
  ClientUnitAuthority,
} from '../users/interfaces/user.interface';

@ApiTags('ClientUnits')
@Controller()
export class ClientUnitsController {
  constructor(private readonly clientUnitsService: ClientUnitsService) {}

  @Post()
  async createClient(@Body() clientUnitDto: ClientUnitDto) {
    return this.clientUnitsService.createClient(clientUnitDto);
  }

  @Post('/:clientUnitId')
  async createBusinessUnit(
    @Body() businessUnitDto: BusinessUnitDto,
    @Param('clientUnitId') clientUnitId: string,
  ) {
    return this.clientUnitsService.createBusinessUnit(
      businessUnitDto,
      clientUnitId,
    );
  }

  @Post('/:clientUnitId/businessUnitId')
  async createBusinessCycle(
    @Body() businessCycleDto: ClientUnitDto,
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
  ) {
    return this.clientUnitsService.createBusinessCycle(
      businessCycleDto,
      clientUnitId,
      businessUnitId,
    );
  }

  @Get()
  async readAllClient(@Query(new parseQueryPipe()) query: any) {
    return this.clientUnitsService.readAllClient(query);
  }

  @Get(':clientUnitId/vendor')
  async readVendors(@Param('clientUnitId') clientUnitId: string) {
    return this.clientUnitsService.readVendors(clientUnitId);
  }

  @Get('/count')
  async countAllClient() {
    return this.clientUnitsService.countAllClient();
  }

  @Get('/filter')
  async readFilteredClient(@Query(new parseQueryPipe()) query: any) {
    return this.clientUnitsService.readFilteredClient(query);
  }

  @Get('/:clientUnitId')
  async readClient(@Param('clientUnitId') clientUnitId: string) {
    return this.clientUnitsService.readClient(clientUnitId);
  }

  @Get('/:clientUnitId/businessUnitId')
  async readBusinessUnit(
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
  ) {
    return this.clientUnitsService.readBusinessUnit(
      clientUnitId,
      businessUnitId,
    );
  }

  @Get('/:clientUnitId/:businessUnitId/:businessCycleId')
  async readeBusinessCycle(
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
    @Param('businessCycleId') businessCycleId: string,
  ) {
    return this.clientUnitsService.readBusinessCycle(
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
  }

  @Patch()
  async update(@Body() body: PatchBody<ClientUnit>) {
    return this.clientUnitsService.update(body);
  }

  @Patch('/:clientUnitId')
  async updateClient(
    @Body() clientUnitDto: ClientUnitDto,
    @Param('clientUnitId') clientUnitId: string,
  ) {
    return this.clientUnitsService.updateClient(clientUnitDto, clientUnitId);
  }

  @Patch('/:clientUnitId/screenRecording/:toggle')
  async updateClientScreenRecording(
    @Param('clientUnitId') clientUnitId: string,
    @Param('toggle') toggle: boolean,
  ) {
    return this.clientUnitsService.updateClient(
      { isScreenRecordingOn: toggle },
      clientUnitId,
    );
  }

  @Patch('/:clientUnitId/:businessUnitId')
  async updateBusinessUnit(
    @Body() businessUnitDto: BusinessUnitDto,
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
  ) {
    return this.clientUnitsService.updateBusinessUnit(
      businessUnitDto,
      clientUnitId,
      businessUnitId,
    );
  }

  @Patch('/:clientUnitId/:businessUnitId/:businessCycleId')
  async updateBusinessCycle(
    @Body() businessCycleDto: ClientUnitDto,
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
    @Param('businessCycleId') businessCycleId: string,
  ) {
    return this.clientUnitsService.updateBusinessCycle(
      businessCycleDto,
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
  }

  @Delete('/:clientUnitId')
  async deleteClient(@Param('clientUnitId') clientUnitId: string) {
    return this.clientUnitsService.deleteClient(clientUnitId);
  }

  @Delete('/:clientUnitId/:businessUnitId')
  async deleteBusinessUnit(
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
  ) {
    return this.clientUnitsService.deleteBusinessUnit(
      clientUnitId,
      businessUnitId,
    );
  }

  @Delete('/:clientUnitId/:businessUnitId/:businessCycleId')
  async deleteBusinessCycle(
    @Param('clientUnitId') clientUnitId: string,
    @Param('businessUnitId') businessUnitId: string,
    @Param('businessCycleId') businessCycleId: string,
  ) {
    return this.clientUnitsService.deleteBusinessCycle(
      clientUnitId,
      businessUnitId,
      businessCycleId,
    );
  }

  @Get('/verifyAuthCode/:authCode')
  async verifyAuthCode(@Param('authCode') authCode: string) {
    return this.clientUnitsService.verifyAuthCode(authCode);
  }
}

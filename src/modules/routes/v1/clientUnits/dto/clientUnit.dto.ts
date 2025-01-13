import { BusinessCycle } from '../schemas/clientUnit.schema';

export class ClientUnitDto {}

export class BusinessUnitDto {
  _id: string;
  vendor: string;
  name: string;
  countryIds: string[];
  adminCountryIds: string[];
  businessCycles: BusinessCycle[];
}

export class BusinessCycleDto {}

export class SettingsByDomainDto {}

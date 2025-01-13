import * as AutoIncrementFactory from 'mongoose-sequence';

import { Domain, DomainSchema } from './schemas/domain.schema';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';

import { Connection } from 'mongoose';
import { DomainsController } from './domains.controller';
import DomainsRepository from './domains.repository';
import DomainsService from './domains.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Domain.name,
        useFactory: async (connection: Connection) => {
          const schema = DomainSchema;
          const autoIncrement = AutoIncrementFactory(connection);
          schema.plugin(autoIncrement, {
            id: 'domains_visibleId',
            inc_field: 'visibleId',
            disable_hooks: true,
            start_seq: 12,
          });
          return schema;
        },
        inject: [getConnectionToken()],
      },
    ]),
    // MongooseModule.forFeature([{ name: Domain.name, schema: DomainSchema }]),
  ],
  controllers: [DomainsController],
  providers: [DomainsService, DomainsRepository],
  exports: [DomainsService, DomainsRepository],
})
export default class DomainsModule {}

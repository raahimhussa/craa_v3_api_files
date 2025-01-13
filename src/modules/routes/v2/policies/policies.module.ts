import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoliciesController } from './policies.controller';
import PoliciesRepository from './policies.repository';
import PoliciesService from './policies.service';
import { Policy, PolicySchema } from './schemas/policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }]),
  ],
  controllers: [PoliciesController],
  providers: [PoliciesService, PoliciesRepository],
  exports: [PoliciesService, PoliciesRepository],
})
export default class PoliciesModule {}

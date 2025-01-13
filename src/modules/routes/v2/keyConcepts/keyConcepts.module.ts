import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyConceptsController } from './keyConcepts.controller';
import KeyConceptsRepository from './keyConcepts.repository';
import KeyConceptsService from './keyConcepts.service';
import { KeyConcept, KeyConceptSchema } from './schemas/keyConcept.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KeyConcept.name, schema: KeyConceptSchema },
    ]),
  ],
  controllers: [KeyConceptsController],
  providers: [KeyConceptsService, KeyConceptsRepository],
  exports: [KeyConceptsService, KeyConceptsRepository],
})
export default class KeyConceptsModule {}

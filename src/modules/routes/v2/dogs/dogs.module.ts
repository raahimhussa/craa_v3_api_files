import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DogsController } from './dogs.controller';
import DogsRepository from './dogs.repository';
import DogsService from './dogs.service';
import { Dog, DogSchema } from './schemas/dog.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dog.name, schema: DogSchema }])],
  controllers: [DogsController],
  providers: [DogsService, DogsRepository],
  exports: [DogsService, DogsRepository],
})
export default class DogsModule {}

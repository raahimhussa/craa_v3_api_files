import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SettingsModule from '../settings/settings.module';
import { AnswersController } from './answers.controller';
import AnswersRepository from './answers.repository';
import AnswersService from './answers.service';
import { Answer, AnswerSchema } from './schemas/answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Answer.name, schema: AnswerSchema }]),
    SettingsModule,
  ],
  controllers: [AnswersController],
  providers: [AnswersService, AnswersRepository],
  exports: [AnswersService, AnswersRepository],
})
export default class AnswersModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
// new ones
import { isArray } from 'lodash';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AssessmentTypesController } from '../assessmentTypes.controller';
import {
  AssessmentType,
  AssessmentTypeSchema,
} from '../schemas/assessmentType.schema';
import AssessmentTypesService from '../assessmentTypes.service';
import AssessmentTypesRepository from '../assessmentTypes.repository';
import { assessmentTypeStub } from './stubs/assessmentTypes.stub';
import TrainingsService from 'src/modules/routes/v2/trainings/training.service';
import TrainingsRepository from 'src/modules/routes/v2/trainings/training.repository';
import {
  Training,
  TrainingSchema,
} from 'src/modules/routes/v2/trainings/schemas/training.schema';

describe('AssessmentTypesController', () => {
  //controller
  let assessmentTypesController: AssessmentTypesController;
  // 가짜 mongodb server
  let mongod: MongoMemoryServer;
  // mongodb connection
  let mongoConnection: Connection;
  // data model
  let assessmentTypeModel: Model<AssessmentType>;
  let trainingModel: Model<Training>;

  //test를 시작 하기 전에
  beforeAll(async () => {
    // ram에 mongo server 생성
    mongod = await MongoMemoryServer.create();
    //mongo server uri
    const uri = mongod.getUri();
    //uri에 접속
    mongoConnection = (await connect(uri)).connection;
    // model 연결해서 저장
    assessmentTypeModel = mongoConnection.model(
      AssessmentType.name,
      AssessmentTypeSchema,
    );
    trainingModel = mongoConnection.model(Training.name, TrainingSchema);

    // tesing module 생성
    // 실제 module과 같은 providers 넣어준 후
    // { provide: getModelToken(AssessmentType.name), useValue: AssessmentTypeModel }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentTypesController],
      providers: [
        AssessmentTypesService,
        AssessmentTypesRepository,
        TrainingsService,
        TrainingsRepository,
        {
          provide: getModelToken(AssessmentType.name),
          useValue: assessmentTypeModel,
        },
        {
          provide: getModelToken(Training.name),
          useValue: trainingModel,
        },
      ],
    }).compile();

    //assigning controller
    assessmentTypesController = module.get<AssessmentTypesController>(
      AssessmentTypesController,
    );
  });

  // 테스트를 다 맞친 후 디비 연결 제거
  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  // 각 테스트 후 생성한 db 컬렉션 지워주기
  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  // post test
  describe('postAssessmentType', () => {
    // 데이터를 create하면 생성된 데이터를 리턴하므로 리턴값 확인
    it('should return the saved object', async () => {
      const createdAssessmentType = await assessmentTypesController.create(
        assessmentTypeStub(),
      );
      //expect().soStrictEqual() : expect() 안에 있는 값이 toStrictEqual() 안에 있는 값과 일치 해야한다
      expect(
        new mongoose.Types.ObjectId(createdAssessmentType._id),
      ).toStrictEqual(assessmentTypeStub()._id);
    });
  });

  describe('getAssessmentType', () => {
    it('should return the corresponding saved object', async () => {
      await new assessmentTypeModel(assessmentTypeStub()).save();
      const assessmentType = await assessmentTypesController.find({
        filter: {
          _id: assessmentTypeStub()._id.toString(),
        },
      });
      expect(
        new mongoose.Types.ObjectId(
          isArray(assessmentType) ? assessmentType[0]._id : assessmentType._id,
        ),
      ).toStrictEqual(assessmentTypeStub()._id);
    });
  });

  describe('updateAssessmentType', () => {
    it('should return the corresponding updated object', async () => {
      await new assessmentTypeModel(assessmentTypeStub()).save();
      const AssessmentType: any = await assessmentTypesController.update({
        filter: {
          _id: assessmentTypeStub()._id.toString(),
        },
        update: {
          label: 'updated label',
        },
      });
      expect(AssessmentType.modifiedCount).toStrictEqual(1);
      const updated = await assessmentTypesController.find({
        filter: {
          _id: assessmentTypeStub()._id.toString(),
        },
      });
      expect(isArray(updated) ? updated[0].label : updated.label).toStrictEqual(
        'updated label',
      );
    });
  });

  describe('deleteAssessmentType', () => {
    it('should return the corresponding deleted object', async () => {
      await new assessmentTypeModel(assessmentTypeStub()).save();
      const AssessmentType: any = await assessmentTypesController.delete(
        assessmentTypeStub()._id.toString(),
      );
      expect(AssessmentType.deletedCount).toStrictEqual(1);
    });
  });

  it('should return null', async () => {
    const assessmentType = await assessmentTypesController.find({
      filter: {
        key: 'key',
      },
    });
    expect(assessmentType).toBeNull();
  });
});

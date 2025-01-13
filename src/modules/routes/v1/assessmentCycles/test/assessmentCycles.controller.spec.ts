import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
// new ones
import { isArray } from 'lodash';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AssessmentCyclesController } from '../assessmentCycles.controller';
import {
  AssessmentCycle,
  AssessmentCycleSchema,
} from '../assessmentCycle.schema';
import { AssessmentCyclesService } from '../assessmentCycles.service';
import AssessmentCyclesRepository from '../assessmentCycles.repository';
import { assessmentCycleStub } from './stubs/assessmentCycles.stub';

describe('AssessmentCyclesController', () => {
  //controller
  let assessmentCyclesController: AssessmentCyclesController;
  // 가짜 mongodb server
  let mongod: MongoMemoryServer;
  // mongodb connection
  let mongoConnection: Connection;
  // data model
  let assessmentCycleModel: Model<AssessmentCycle>;

  //test를 시작 하기 전에
  beforeAll(async () => {
    // ram에 mongo server 생성
    mongod = await MongoMemoryServer.create();
    //mongo server uri
    const uri = mongod.getUri();
    //uri에 접속
    mongoConnection = (await connect(uri)).connection;
    // model 연결해서 저장
    assessmentCycleModel = mongoConnection.model(
      AssessmentCycle.name,
      AssessmentCycleSchema,
    );

    // tesing module 생성
    // 실제 module과 같은 providers 넣어준 후
    // { provide: getModelToken(Agreement.name), useValue: agreementModel }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentCyclesController],
      providers: [
        AssessmentCyclesService,
        AssessmentCyclesRepository,
        {
          provide: getModelToken(AssessmentCycle.name),
          useValue: assessmentCycleModel,
        },
      ],
    }).compile();
    //assigning controller
    assessmentCyclesController = module.get<AssessmentCyclesController>(
      AssessmentCyclesController,
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
  describe('postAssessmentCycle', () => {
    it('should return the saved object', async () => {
      const createdAgreement = await assessmentCyclesController.create(
        assessmentCycleStub(),
      );
      expect(new mongoose.Types.ObjectId(createdAgreement._id)).toStrictEqual(
        assessmentCycleStub()._id,
      );
    });
  });

  describe('getAssessmentCycle', () => {
    it('should return the corresponding saved object', async () => {
      await new assessmentCycleModel(assessmentCycleStub()).save();
      const article = await assessmentCyclesController.find({
        filter: {
          _id: assessmentCycleStub()._id.toString(),
        },
      });
      expect(
        new mongoose.Types.ObjectId(
          isArray(article) ? article[0]._id : article._id,
        ),
      ).toStrictEqual(assessmentCycleStub()._id);
    });
  });
  describe('getAssessmentCycleById', () => {
    it('should return the corresponding saved object', async () => {
      await new assessmentCycleModel(assessmentCycleStub()).save();
      const article = await assessmentCyclesController.findById(
        assessmentCycleStub()._id.toString(),
      );
      expect(
        new mongoose.Types.ObjectId(
          isArray(article) ? article[0]._id : article._id,
        ),
      ).toStrictEqual(assessmentCycleStub()._id);
    });
  });

  describe('updateAssessmentCycle', () => {
    it('should return the corresponding updated object', async () => {
      await new assessmentCycleModel(assessmentCycleStub()).save();
      const agreement: any = await assessmentCyclesController.update({
        filter: {
          _id: assessmentCycleStub()._id.toString(),
        },
        update: {
          name: 'updated name',
        },
      });
      expect(agreement.modifiedCount).toStrictEqual(1);
      const updated = await assessmentCyclesController.find({
        filter: {
          _id: assessmentCycleStub()._id.toString(),
        },
      });
      expect(isArray(updated) ? updated[0].name : updated.name).toStrictEqual(
        'updated name',
      );
    });
  });

  describe('deleteAssessmentCycle', () => {
    it('should return the corresponding deleted object', async () => {
      await new assessmentCycleModel(assessmentCycleStub()).save();
      const agreement: any = await assessmentCyclesController.delete(
        assessmentCycleStub()._id.toString(),
      );
      expect(agreement.deletedCount).toStrictEqual(1);
    });
  });
  it('should return null', async () => {
    const article = await assessmentCyclesController.find({
      filter: {
        key: 'key',
      },
    });
    expect(article).toBeNull();
  });
});

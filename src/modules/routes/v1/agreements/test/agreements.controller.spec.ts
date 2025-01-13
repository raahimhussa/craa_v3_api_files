import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
// new ones
import AgreementsController from '../agreements.controller';
import { Agreement, AgreementSchema } from '../schemas/agreement.schema';
import { agreementStub } from '../test/stubs/agreements.stub';
import AgreementsService from '../agreements.service';
import AgreementsRepository from '../agreements.repository';
import { isArray } from 'lodash';
import { HttpException, HttpStatus } from '@nestjs/common';

export class AgreementAlreadyExists extends HttpException {
  constructor() {
    super('Agreement already exists!', HttpStatus.BAD_REQUEST);
  }
}

describe('AgreementsController', () => {
  //controller
  let agreementsController: AgreementsController;
  // 가짜 mongodb server
  let mongod: MongoMemoryServer;
  // mongodb connection
  let mongoConnection: Connection;
  // data model
  let agreementModel: Model<Agreement>;

  //test를 시작 하기 전에
  beforeAll(async () => {
    // ram에 mongo server 생성
    mongod = await MongoMemoryServer.create();
    //mongo server uri
    const uri = mongod.getUri();
    //uri에 접속
    mongoConnection = (await connect(uri)).connection;
    // model 연결해서 저장
    agreementModel = mongoConnection.model(Agreement.name, AgreementSchema);

    // tesing module 생성
    // 실제 module과 같은 providers 넣어준 후
    // { provide: getModelToken(Agreement.name), useValue: agreementModel }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgreementsController],
      providers: [
        AgreementsService,
        AgreementsRepository,
        { provide: getModelToken(Agreement.name), useValue: agreementModel },
      ],
    }).compile();
    //assigning controller
    agreementsController =
      module.get<AgreementsController>(AgreementsController);
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
  describe('postAgreement', () => {
    it('should return the saved object', async () => {
      const createdAgreement = await agreementsController.create(
        agreementStub(),
      );
      expect(new mongoose.Types.ObjectId(createdAgreement._id)).toStrictEqual(
        agreementStub()._id,
      );
    });
  });

  describe('getAgreement', () => {
    it('should return the corresponding saved object', async () => {
      await new agreementModel(agreementStub()).save();
      const article = await agreementsController.find({
        filter: {
          _id: agreementStub()._id.toString(),
        },
      });
      expect(
        new mongoose.Types.ObjectId(
          isArray(article) ? article[0]._id : article._id,
        ),
      ).toStrictEqual(agreementStub()._id);
    });
  });

  describe('updateAgreement', () => {
    it('should return the corresponding updated object', async () => {
      await new agreementModel(agreementStub()).save();
      const agreement: any = await agreementsController.update({
        filter: {
          _id: agreementStub()._id.toString(),
        },
        update: {
          kind: 'updated kind',
        },
      });
      expect(agreement.modifiedCount).toStrictEqual(1);
      const updated = await agreementsController.find({
        filter: {
          _id: agreementStub()._id.toString(),
        },
      });
      expect(isArray(updated) ? updated[0].kind : updated.kind).toStrictEqual(
        'updated kind',
      );
    });
  });

  describe('deleteAgreement', () => {
    it('should return the corresponding deleted object', async () => {
      await new agreementModel(agreementStub()).save();
      const agreement: any = await agreementsController.delete(
        agreementStub()._id.toString(),
      );
      expect(agreement.deletedCount).toStrictEqual(1);
    });
  });

  it('should return null', async () => {
    const article = await agreementsController.find({
      filter: {
        key: 'key',
      },
    });
    expect(article).toBeNull();
  });
});

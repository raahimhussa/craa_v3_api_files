import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DeleteQuery,
  FindQuery,
  MongoQuery,
  PatchBody,
} from 'src/common/interfaces/mongoose.entity';
import { ConfigService } from '@nestjs/config';
import { parseQueryPipe } from 'src/common/pipes/parseQueryPipe';
import { S3 } from 'aws-sdk';
import {
  TrainingResource,
  TrainingResourceDocument,
} from './schemas/trainingResources.schema';
import CreateFileDto from './dto/create-file.dto';
import { TrainingResourcesService } from './trainingResources.service';
import { Utils } from 'src/utils/utils';
import { v4 as uuid } from 'uuid';
import SystemSettingsService from '../systemSettings/systemSettings.service';
import { decrypt } from 'src/decrypt';
@ApiTags('TrainingResources')
@Controller()
export class TrainingResourcesController {
  constructor(
    private readonly trainingResourcesService: TrainingResourcesService,
    private systemSettingsService: SystemSettingsService,
    private configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto) {
    return this.trainingResourcesService.create(createFileDto);
  }

  @Get()
  async find(
    @Query(new parseQueryPipe()) query: FindQuery<TrainingResourceDocument>,
  ) {
    return this.trainingResourcesService.find(query);
  }

  @Get('/count')
  async getNumberOfElement(
    @Query(new parseQueryPipe()) query: MongoQuery<TrainingResource>,
  ) {
    return this.trainingResourcesService.getNumberOfElement(query);
  }

  @Get('image')
  async imageFind(@Query() query: FindQuery<TrainingResourceDocument>) {
    return this.trainingResourcesService.imageFind(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<TrainingResourceDocument>) {
    return this.trainingResourcesService.update(body);
  }

  @Delete()
  async delete(
    @Query(new parseQueryPipe()) query: DeleteQuery<TrainingResourceDocument>,
  ) {
    return this.trainingResourcesService.delete(query);
  }

  @Post('sign')
  async uploadFile(@Body() file: any): Promise<any> {
    let result = null;
    let s3Config = {} as any;
    let awsSmtpKeys = {} as any;
    const texts = await this.systemSettingsService.findAll();
    texts.forEach((_text) => {
      const keys = decrypt(_text.enck, `${_text.thfxm}${_text.cAtRaw}`);
      if (_text.id === 'tmfl') {
        s3Config = { ...keys };
      } else if (_text.id === 'dpax') {
        awsSmtpKeys = { ...keys };
      }
    });
    s3Config = {
      region: s3Config.rVal,
      bucketName: 'craa-sr-data',
      awsAccessKeyId: s3Config.aKey,
      awsSecretAccessKey: s3Config.sKey,
      expires: 3000,
      acl: 'public-read',
    };
    const s3 = new S3({
      credentials: {
        accessKeyId: s3Config.awsAccessKeyId,
        secretAccessKey: s3Config.awsSecretAccessKey,
      },
      region: s3Config.region,
    });
    const extension = Utils.getExtentionFrom(file.type);
    const fileKey = `${file.name}.${extension}`;
    const getSignedUrl = async (file: any) => {
      const params = {
        Bucket: s3Config.bucketName,
        Key: fileKey,
        Expires: s3Config.expires,
        ACL: s3Config.acl,
      };

      const url = Utils.s3Url(fileKey, s3Config.region, s3Config.bucketName);

      const signedUrl = await s3.getSignedUrl('putObject', params);

      return { url, signedUrl, ...file };
    };

    result = await getSignedUrl(file);
    return result;
  }
}

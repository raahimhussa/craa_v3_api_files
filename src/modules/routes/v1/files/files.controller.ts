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
import { File, FileDocument } from './schemas/files.schema';
import CreateFileDto from './dto/create-file.dto';
import { FilesService } from './files.service';
import { Utils } from 'src/utils/utils';
import { v4 as uuid } from 'uuid';
import SystemSettingsService from '../systemSettings/systemSettings.service';
import { decrypt } from 'src/decrypt';
@ApiTags('Files')
@Controller()
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly systemSettingsService: SystemSettingsService,
    private configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }

  @Get()
  async find(@Query(new parseQueryPipe()) query: FindQuery<FileDocument>) {
    return this.filesService.find(query);
  }

  @Get('/count')
  async getNumberOfElement(
    @Query(new parseQueryPipe()) query: MongoQuery<File>,
  ) {
    return this.filesService.getNumberOfElement(query);
  }

  @Get('image')
  async imageFind(@Query() query: FindQuery<FileDocument>) {
    return this.filesService.imageFind(query);
  }

  @Patch()
  async update(@Body() body: PatchBody<FileDocument>) {
    return this.filesService.update(body);
  }

  @Delete()
  async delete(@Query(new parseQueryPipe()) query: DeleteQuery<FileDocument>) {
    return this.filesService.delete(query);
  }

  @Post('sign')
  async uploadFile(@Body() file: any): Promise<any> {
    let result = null;
    const texts = await this.systemSettingsService.findDBKeys();
    let s3Config = {} as any;
    let awsSmtpKeys = {} as any;
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

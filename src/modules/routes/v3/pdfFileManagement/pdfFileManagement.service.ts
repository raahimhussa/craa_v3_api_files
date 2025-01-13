import { File, FileDocument } from '../../v1/files/schemas/files.schema';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';
import { PdfFile, PdfFileCreateDto } from './dto/pdfFileManagement.dto';
import {
  PdfFolder,
  PdfFolderDocument,
} from '../../v2/pdfFolders/schemas/pdfFolder.schema';
import mongoose, { Model } from 'mongoose';

import { FilesService } from '../../v1/files/files.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { PdfFolderCreateDto } from '../../v2/pdfFolders/dto/pdfFolder.dto';
import PdfFoldersService from '../../v2/pdfFolders/pdfFolders.service';

@Injectable()
export default class PdfFileManagementService {
  constructor(
    private readonly filesService: FilesService,
    private readonly pdfFoldersService: PdfFoldersService,
  ) {}

  async onModuleInit() {
    const rootPdfFolder: PdfFolderCreateDto = {
      name: 'Home',
      path: '/',
      isRoot: true,
    };
    const rootFolder = await this.pdfFoldersService.find({
      filter: {
        isRoot: true,
      },
    });
    if (rootFolder.length === 0) {
      await this.pdfFoldersService.create(rootPdfFolder);
    }
  }

  public async create(pdfFileCreateDtos: PdfFileCreateDto[]) {
    try {
      const tmp: string[] = [];
      pdfFileCreateDtos.forEach((_pdfFileCreateDto) => {
        if (!_pdfFileCreateDto || _pdfFileCreateDto.path === '') return;
        const paths = _pdfFileCreateDto.path.split('/');
        for (let path = paths; path.length > 0; path.pop()) {
          tmp.push(path.slice(0, path.length - 1).join('/'));
        }
      });
      const folderPaths: string[] = Array.from(new Set(tmp));
      await Promise.all(
        folderPaths.map(async (folderPath) => {
          if (!folderPath) return;
          const name = folderPath.split('/')[folderPath.split('/').length - 1];
          const path = folderPath
            .split('/')
            .slice(0, folderPath.split('/').length - 1)
            .join('/');
          await this.pdfFoldersService.update({
            filter: {
              name,
              path,
            },
            options: {
              upsert: true,
            },
          });
        }),
      );
      const isDuplicatedName = async (path: string, name: string) => {
        const prevFile = await this.filesService.find({
          filter: {
            path,
            name,
          },
        });
        if (prevFile.length > 0) return true;
        return false;
      };
      const ret = await Promise.all(
        pdfFileCreateDtos.map(async (_pdfFileCreateDto) => {
          if (!_pdfFileCreateDto) return;
          const pathMap = _pdfFileCreateDto.path.split('/');
          const path = pathMap.slice(0, pathMap.length - 1).join('/');
          let duplicationCount = 0;
          let tmpName = _pdfFileCreateDto.name;
          while (await isDuplicatedName(path, tmpName)) {
            duplicationCount++;
            tmpName = _pdfFileCreateDto.name + `(${duplicationCount})`;
          }
          _pdfFileCreateDto.name = tmpName;
          // const parentFolder = allFolders.find((_folder) => {
          //   const fullPath =
          //     _folder.path === '/'
          //       ? '/' + _folder.name
          //       : _folder.path + '/' + _folder.name;
          //   return fullPath === path;
          // });
          // _pdfFileCreateDto.folderId = parentFolder._id.toString();
          return await this.filesService.create({ ..._pdfFileCreateDto, path });
        }),
      );
      return ret;
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async find(
    path: string,
    name: string,
  ): Promise<{ files: File[]; folders: PdfFolder[] }> {
    try {
      const currentFolder = await this.pdfFoldersService.find({
        filter: {
          path,
          name,
          isDeleted: false,
        },
      });
      let folderPath = '/';
      if (currentFolder.length > 0) {
        folderPath = (
          currentFolder[0].path +
          '/' +
          currentFolder[0].name
        ).replace('//', '/');
      }
      const files = await this.filesService.pdfFind(folderPath);
      if (currentFolder.length === 0) {
        return {
          files: [],
          folders: [],
        };
      }
      const folders = await this.pdfFoldersService.find({
        filter: {
          isDeleted: false,
          path: (path + '/' + name).replace('//', '/'),
        },
      });
      return {
        files,
        folders: folders.filter((_f) => !_f.isRoot),
      };
    } catch (e) {
      console.error({ e });
      throw e;
    }
  }

  public async findWithSearch(
    searchString?: string,
  ): Promise<{ files: File[]; folders: PdfFolder[] }> {
    // yes search string
    if (searchString) {
      try {
        const files = await this.filesService.find({
          filter: {
            isDeleted: false,
            mimeType: 'application/pdf',
            name: { $regex: searchString, $options: 'i' },
          },
        });
        return {
          files,
          folders: [],
        };
      } catch (e) {
        console.error({ e });
        throw e;
      }
    }
  }

  public async count(query: MongoQuery<PdfFolder>) {
    // return this.pdfFileManagementRepository.count(query);
  }

  public async findOne(query: MongoQuery<PdfFolder>): Promise<PdfFile | null> {
    // return this.pdfFileManagementRepository.findOne(query);
    return null;
  }

  public async findById(id: string): Promise<PdfFolder | null> {
    // return this.pdfFileManagementRepository.findById(id);
    return null;
  }

  public async update(pdfFileCreateDtos: PdfFileCreateDto[]) {
    // return this.pdfFileManagementRepository.update(body);
    return null;
  }

  public async rename(_id: string, changedName: string, type: string) {
    try {
      if (type === 'folder') {
        const folders = await this.pdfFoldersService.find({
          filter: { _id: new mongoose.Types.ObjectId(_id) },
        });
        if (folders.length === 0) return null;
        const folder = folders[0];
        const prevFolder = await this.pdfFoldersService.find({
          filter: {
            path: folder.path,
            name: changedName,
          },
        });
        if (prevFolder.length > 0) {
          throw 'There is same name of folder';
        }
        await this.pdfFoldersService.update({
          filter: {
            _id,
          },
          update: {
            name: changedName,
          },
        });
        const folderPath = (folder.path + '/' + folder.name).replace('//', '/');
        const newFolderPath = (folder.path + '/' + changedName).replace(
          '//',
          '/',
        );
        const foundPdfFolders = await this.pdfFoldersService.find({
          filter: {
            path: {
              $regex: new RegExp(`(^${folderPath}$)|(^${folderPath}\/)`),
            },
          },
        });
        const pdfFoldersPromise = foundPdfFolders.map(async (doc) => {
          doc.path = doc.path.replace(folderPath, newFolderPath);
          await this.pdfFoldersService.update({
            filter: { _id: doc._id },
            update: {
              ...doc,
            },
          });
        });
        const foundFiles = await this.filesService.queryFind({
          filter: {
            path: {
              $regex: new RegExp(`(^${folderPath}$)|(^${folderPath}\/)`),
            },
          },
        });
        const filesPromise = foundFiles.map(async (doc) => {
          doc.path = doc.path.replace(folderPath, newFolderPath);
          await this.filesService.update({
            filter: { _id: doc._id },
            update: {
              ...doc,
            },
          });
        });
        await Promise.all([...pdfFoldersPromise, ...filesPromise]);
        return true;
      }
      if (type === 'file') {
        const files = await this.filesService.find({
          filter: { _id: new mongoose.Types.ObjectId(_id) },
        });
        if (files.length === 0) return null;
        const file = files[0];
        const prevFile = await this.filesService.find({
          filter: {
            path: file.path,
            name: changedName,
          },
        });
        if (prevFile.length > 0) {
          throw 'There is same name of file';
        }
        await this.filesService.update({
          filter: { _id },
          update: {
            name: changedName,
          },
        });
        return true;
      }
      // return this.pdfFileManagementRepository.update(body);
      return false;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  public async delete(body: MongoDelete<PdfFolder>) {
    // return this.pdfFileManagementRepository.deleteMany(body);
    return null;
  }
}

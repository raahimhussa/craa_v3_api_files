import * as tmp from 'tmp';

import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import {
  MongoDelete,
  MongoQuery,
  MongoUpdate,
} from 'src/common/interfaces/mongoose.entity';

import { Domain } from './schemas/domain.schema';
import DomainDto from './dto/domain.dto';
import DomainsRepository from './domains.repository';
import { Workbook } from 'exceljs';

@Injectable()
export default class DomainsService implements OnModuleInit {
  constructor(private readonly domainsRepository: DomainsRepository) {}

  // Cannot be sure if we still need this?
  onModuleInit() {
    // const domains = [
    //   {
    //     name: 'Source Data Review',
    //     visibleId: 1,
    //     followupNumber: 1,
    //     seq: 1,
    //     children: [],
    //   },
    //   {
    //     name: 'Source Data Verification',
    //     visibleId: 2,
    //     followupNumber: 2,
    //     seq: 2,
    //     children: [
    //       {
    //         name: 'Source Documentation',
    //         visibleId: 3,
    //         followupNumber: 2,
    //         seq: 3,
    //         children: [],
    //       },
    //       {
    //         name: 'Source to EDC/EDC',
    //         visibleId: 4,
    //         followupNumber: 2,
    //         seq: 4,
    //         children: [],
    //       },
    //       {
    //         name: 'Source Documentation/Source to EDC/EDC',
    //         visibleId: 5,
    //         followupNumber: 2,
    //         seq: 5,
    //         children: [],
    //       },
    //     ],
    //   },

    //   {
    //     name: 'The Informed Consent Process',
    //     visibleId: 6,
    //     followupNumber: 3,
    //     seq: 6,
    //     children: [
    //       {
    //         name: 'ICF Process',
    //         visibleId: 7,
    //         followupNumber: 3,
    //         seq: 7,
    //         children: [],
    //       },
    //     ],
    //   },

    //   {
    //     name: 'IRB/IEC Submission Approval',
    //     visibleId: 8,
    //     followupNumber: 4,
    //     seq: 8,
    //     children: [
    //       {
    //         name: 'IRB Submission Approval',
    //         visibleId: 9,
    //         followupNumber: 4,
    //         seq: 9,
    //         children: [],
    //       },
    //       {
    //         name: 'IEC Submission Approval',
    //         visibleId: 10,
    //         followupNumber: 4,
    //         seq: 10,
    //         children: [],
    //       },
    //     ],
    //   },
    //   {
    //     name: 'Potential Fraud, Scientific Misconduct and Delegation of Authority',
    //     visibleId: 11,
    //     followupNumber: 5,
    //     seq: 11,
    //     children: [
    //       {
    //         name: 'Potential Fraud',
    //         visibleId: 12,
    //         followupNumber: 5,
    //         seq: 12,
    //         children: [],
    //       },
    //       {
    //         name: 'Delegation of Authority',
    //         visibleId: 13,
    //         followupNumber: 5,
    //         seq: 13,
    //         children: [],
    //       },
    //       {
    //         name: 'Delegation of Authority and Training',
    //         visibleId: 14,
    //         followupNumber: 5,
    //         seq: 14,
    //         children: [],
    //       },
    //       {
    //         name: 'Potential Fraud/Scientific Misconduct',
    //         visibleId: 15,
    //         followupNumber: 5,
    //         seq: 15,
    //         children: [],
    //       },
    //     ],
    //   },
    //   {
    //     name: 'IRB/IEC Reporting',
    //     visibleId: 16,
    //     followupNumber: -1,
    //     seq: 16,
    //     children: [
    //       {
    //         name: 'EC Reporting',
    //         visibleId: 17,
    //         followupNumber: -1,
    //         seq: 17,
    //         children: [],
    //       },
    //       {
    //         name: 'IEC Reporting',
    //         visibleId: 18,
    //         followupNumber: -1,
    //         seq: 18,
    //         children: [],
    //       },
    //       {
    //         name: 'IRB Reporting',
    //         visibleId: 19,
    //         followupNumber: -1,
    //         seq: 19,
    //         children: [],
    //       },
    //     ],
    //   },
    // ];

    // const values = Object.keys(domains);
    // const defaultDomain: Omit<DomainDto, '_id'> = {
    //   name: '',
    //   visibleId: -1,
    //   isDeleted: false,
    //   parentId: '',
    //   depth: 0,
    //   seq: -1,
    //   followupNumber: -1,
    //   createdAt: undefined,
    //   updatedAt: undefined,
    // };

    // domains.forEach(async (value, index) => {
    //   const _domain = { ...defaultDomain };
    //   _domain.name = value.name;
    //   _domain.depth = 0;
    //   _domain.createdAt = new Date();
    //   _domain.updatedAt = new Date();
    //   _domain.parentId = null;
    //   _domain.followupNumber = value.followupNumber;
    //   _domain.visibleId = value.visibleId;
    //   _domain.seq = value.seq;
    //   const isDomainExist = await this.findOne({
    //     filter: { visibleId: value.visibleId, seq: value.seq },
    //   });
    //   if (isDomainExist) return console.log(isDomainExist.name, 'exist!!');

    //   const newDomain = await this.create(_domain, true);

    //   const promises = domains[index].children.map(async (_value) => {
    //     const subDomain = { ...defaultDomain };
    //     subDomain.name = _value.name;
    //     subDomain.visibleId = _value.visibleId;
    //     subDomain.depth = 1;
    //     subDomain.parentId = newDomain._id;
    //     subDomain.followupNumber = _value.followupNumber;
    //     subDomain.seq = _value.seq;
    //     subDomain.createdAt = new Date();
    //     subDomain.updatedAt = new Date();
    //     await this.create(subDomain, true);
    //   });

    //   await Promise.all(promises);
    // });
  }

  public async create(
    domain: DomainDto,
    isInit?: boolean,
  ): Promise<Domain | null> {
    const _domain = {
      ...domain,
      _id: undefined,
      parentId: domain.parentId ? domain.parentId : null,
    };
    if (!isInit) {
      const visibleId = await this.domainsRepository.findMaxNumber();
      _domain.visibleId = visibleId + 1;
    }
    const data = await this.domainsRepository.create(_domain);
    return data;
  }

  public async find(query: MongoQuery<Domain>): Promise<Domain[] | null> {
    return this.domainsRepository.find(query);
  }

  public async excelExport() {
    const domains = await this.domainsRepository.find({
      filter: { isDeleted: false },
    });

    const wb = new Workbook();
    const ws = wb.addWorksheet('Simulations');
    ws.addRow(['id', 'name', 'parent domain name', 'followup number']);

    domains.forEach((_domain) => {
      const id = _domain.visibleId > 0 ? _domain.visibleId : '';
      const name = _domain.name;
      const parentDomain =
        domains.find((__domain) => __domain._id.toString() === _domain.parentId)
          ?.name || '';
      const followupNumber = _domain.followupNumber;
      ws.addRow([id, name, parentDomain, followupNumber]);
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'tmp',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          wb.xlsx
            .writeFile(file)
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });
    return File;
  }

  public async findOne(query: MongoQuery<Domain>): Promise<Domain | null> {
    return this.domainsRepository.findOne(query);
  }

  public async findById(id: string): Promise<Domain | null> {
    return this.domainsRepository.findById(id);
  }

  public async update(body: MongoUpdate<Domain>): Promise<Domain | null> {
    return this.domainsRepository.update(body);
  }

  public async delete(query: MongoDelete<Domain>): Promise<Domain[] | null> {
    return this.domainsRepository.deleteMany(query);
  }
}

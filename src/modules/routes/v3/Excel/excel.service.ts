import * as tmp from 'tmp';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Readable } from 'stream';
import { Workbook } from 'exceljs';
import { writeFile } from 'fs/promises';
import * as moment from 'moment';
import { isNumber } from 'lodash';
import LogsRepository from '../../v2/logs/logs.repository';
import UsersRepository from '../../v1/users/users.repository';
import TrainingLogsRepository from '../../v2/trainingLogs/trainingLogs.repository';
import NotesRepository from '../../v2/notes/notes.repository';

@Injectable()
export default class ExcelService {
  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly trainingLogsRepository: TrainingLogsRepository,
    private readonly notesRepository: NotesRepository,
  ) {}

  async getStream(buffer: any) {
    const stream = new Readable();

    stream.push(buffer);
    stream.push(null);

    return stream;
  }

  async getRoadmapData(data: any) {
    if (!data) {
      throw new NotFoundException('No data to download.');
    }
    // console.log(JSON.parse(data.data));
    // try {
    const datas = JSON.parse(data.data);

    //creating workbook
    const book = new Workbook();

    //adding a worksheet to workbook
    const sheet = book.addWorksheet('Score');
    Object.keys(datas.info).map((key) => {
      sheet.addRow([key, datas.info[key]]);
    });
    sheet.addRow(' ');
    sheet.addRow([
      'Time',
      'VP1',
      'VP1',
      'VP2',
      'VP2',
      'VP3',
      'VP3',
      // ' ',
      // 'Action',
      // 'Monitoring Notes',
    ]);

    const rowTime = datas.totalTime < 1800000 ? datas.totalTime / 15 : 60000;
    let vp1_doc = [];
    let vp1_time = [];
    let vp2_doc = [];
    let vp2_time = [];
    let vp3_doc = [];
    let vp3_time = [];
    let v1I = 0;
    let v2I = 0;
    let v3I = 0;
    for (let i = 0; i < datas.totalTime / rowTime; i++) {
      if (datas.data['viewport 1'][v1I]?.y[0] >= rowTime * i) {
        vp1_doc.push(' ');
        vp1_time.push(' ');
      } else {
        for (
          let i2 = 0;
          i2 <
          (datas.data['viewport 1'][v1I]?.y[1] -
            datas.data['viewport 1'][v1I]?.y[0]) /
            rowTime;
          i2++
        ) {
          vp1_doc.push(datas.data['viewport 1'][v1I]?.docName);
          vp1_time.push(
            moment
              .utc(
                datas.data['viewport 1'][v1I]?.y[1] -
                  datas.data['viewport 1'][v1I]?.y[0],
              )
              .format('HH:mm:ss'),
          );
          i++;
        }
        v1I++;
      }
    }
    for (let i = 0; i < datas.totalTime / rowTime; i++) {
      if (datas.data['viewport 2'][v2I]?.y[0] >= rowTime * i) {
        vp2_doc.push(' ');
        vp2_time.push(' ');
      } else {
        for (
          let i2 = 0;
          i2 <
          (datas.data['viewport 2'][v2I]?.y[1] -
            datas.data['viewport 2'][v2I]?.y[0]) /
            rowTime;
          i2++
        ) {
          vp2_doc.push(datas.data['viewport 2'][v2I]?.docName);
          vp2_time.push(
            moment
              .utc(
                datas.data['viewport 2'][v2I]?.y[1] -
                  datas.data['viewport 2'][v2I]?.y[0],
              )
              .format('HH:mm:ss'),
          );
          i++;
        }
        v2I++;
      }
    }
    for (let i = 0; i < datas.totalTime / rowTime; i++) {
      if (datas.data['viewport 3'][v3I]?.y[0] >= rowTime * i) {
        vp3_doc.push(' ');
        vp3_time.push(' ');
      } else {
        for (
          let i2 = 0;
          i2 <
          (datas.data['viewport 3'][v3I]?.y[1] -
            datas.data['viewport 3'][v3I]?.y[0]) /
            rowTime;
          i2++
        ) {
          vp3_doc.push(datas.data['viewport 3'][v3I]?.docName);
          vp3_time.push(
            moment
              .utc(
                datas.data['viewport 3'][v3I]?.y[1] -
                  datas.data['viewport 3'][v3I]?.y[0],
              )
              .format('HH:mm:ss'),
          );
          i++;
        }
        v3I++;
      }
    }

    sheet.getColumn(2).values = [...sheet.getColumn(2).values, ...vp1_doc];
    sheet.getColumn(3).values = [...sheet.getColumn(3).values, ...vp1_time];

    let startIndex1 = 7;
    let endIndex1 = 0;
    let lastValue1 = '';
    let overAll = [];

    for (let i = 7; i <= sheet.getColumn(2).values.length; i++) {
      const cell = sheet.getCell(`B${i}`);
      if (cell.value === lastValue1) {
        // sheet.mergeCells(`B${lastMergedRow}:B${i}`);
        endIndex1 = i;
        overAll.push(' ');
      } else {
        if (endIndex1 > startIndex1) {
          sheet.mergeCells(`B${startIndex1}:B${endIndex1}`);
          sheet.mergeCells(`C${startIndex1}:C${endIndex1}`);
        }
        startIndex1 = i;
        lastValue1 = cell.value + '';
        overAll.push(
          datas.data['viewport 1'].find((doc) => doc?.docName === lastValue1)
            ?.y[0] !== undefined
            ? moment
                .utc(
                  datas.data['viewport 1'].find(
                    (doc) => doc?.docName === lastValue1,
                  )?.y[0],
                )
                .format('HH:mm:ss')
            : ' ',
        );
      }
    }
    sheet.getColumn(1).values = [...sheet.getColumn(1).values, ...overAll];
    sheet.getCell('A7').value = '00:00:00';

    sheet.getColumn(4).values = [...sheet.getColumn(4).values, ...vp2_doc];
    sheet.getColumn(5).values = [...sheet.getColumn(5).values, ...vp2_time];
    let startIndex2 = 7;
    let endIndex2 = 0;
    let lastValue2 = '';
    for (let i = 7; i <= sheet.getColumn(4).values.length; i++) {
      const cell = sheet.getCell(`D${i}`);
      if (cell.value === lastValue2) {
        // sheet.mergeCells(`B${lastMergedRow}:B${i}`);
        endIndex2 = i;
      } else {
        if (endIndex2 > startIndex2) {
          sheet.mergeCells(`D${startIndex2}:D${endIndex2}`);
          sheet.mergeCells(`E${startIndex2}:E${endIndex2}`);
        }
        startIndex2 = i;
        lastValue2 = cell.value + '';
      }
    }

    sheet.getColumn(6).values = [...sheet.getColumn(6).values, ...vp3_doc];
    sheet.getColumn(7).values = [...sheet.getColumn(7).values, ...vp3_time];

    let startIndex3 = 7;
    let endIndex3 = 0;
    let lastValue3 = '';

    for (let i = 7; i <= sheet.getColumn(6).values.length; i++) {
      const cell = sheet.getCell(`F${i}`);
      if (cell.value === lastValue3) {
        // sheet.mergeCells(`B${lastMergedRoG}:B${i}`);
        endIndex3 = i;
      } else {
        if (endIndex3 > startIndex3) {
          sheet.mergeCells(`F${startIndex3}:F${endIndex3}`);
          sheet.mergeCells(`G${startIndex3}:G${endIndex3}`);
        }
        startIndex3 = i;
        lastValue3 = cell.value + '';
      }
    }

    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.value || cell.value == 0) {
          cell.alignment = {
            ...cell.alignment,
            // wrapText: true,
            horizontal: 'center',
            vertical: 'middle',
          };
        }
        if (cell.isMerged) {
          return;
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const row = sheet.getRow(6);
    row.font = { bold: true };

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `${datas.info.Name}_${datas.info.Simulation}`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          book.xlsx
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

  async getTrainingLogData(userId: any) {
    if (!userId) {
      throw new NotFoundException('No data to download.');
    }
    //creating workbook
    const book = new Workbook();

    //adding a worksheet to workbook
    const sheet = book.addWorksheet('Training Logs');

    const user = await this.usersRepository.findOne({
      filter: {
        _id: userId,
      },
    });

    sheet.addRow(['First Name', user?.profile?.firstName]);
    sheet.addRow(['Last Name', user?.profile?.lastName]);
    sheet.addRow(['Email', user?.email]);
    sheet.addRow(['User Name', user?.name]);
    sheet.addRow([' ']);

    sheet.addRow(['Training', 'Action', 'Time']);
    const logs = await this.trainingLogsRepository.find({
      filter: {
        userId: userId,
      },
    });

    logs?.map((log: any) => {
      sheet.addRow([
        log?.training?.title,
        log?.event,
        `${moment(log?.createdAt).format('DD-MMM-YYYY')} ${moment(
          log?.createdAt,
        ).format('HH:mm:ss')}`,
      ]);
    });

    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.value || cell.value == 0) {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `${user?.profile?.lastName}_${user?.name}_TrainingLogs`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          book.xlsx
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
  async getNoteData(userId: any) {
    if (!userId) {
      throw new NotFoundException('No data to download.');
    }
    //creating workbook
    const book = new Workbook();

    //adding a worksheet to workbook
    const sheet = book.addWorksheet('Notes');

    const user = await this.usersRepository.findOne({
      filter: {
        _id: userId,
      },
    });

    sheet.addRow(['First Name', user?.profile?.firstName]);
    sheet.addRow(['Last Name', user?.profile?.lastName]);
    sheet.addRow(['Email', user?.email]);
    sheet.addRow(['User Name', user?.name]);
    sheet.addRow([' ']);

    sheet.addRow(['Document', 'Text', 'Time']);
    const notes = await this.notesRepository.find({
      filter: {
        userId: userId,
      },
    });

    notes?.map((note: any) => {
      if (note.type === 'monitoring') {
        sheet.addRow([
          note?.viewport?.simDoc?.title,
          note?.text,
          `${moment(note?.createdAt).format('DD-MMM-YYYY')} ${moment(
            note?.createdAt,
          ).format('HH:mm:ss')}`,
        ]);
      }
    });

    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.value || cell.value == 0) {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `${user?.profile?.lastName}_${user?.name}_Notes`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          book.xlsx
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
  async getUserLogData(userId: any) {
    if (!userId) {
      throw new NotFoundException('No data to download.');
    }
    //creating workbook
    const book = new Workbook();

    //adding a worksheet to workbook
    const sheet = book.addWorksheet('User Logs');

    const user = await this.usersRepository.findOne({
      filter: {
        _id: userId,
      },
    });

    sheet.addRow(['First Name', user?.profile?.firstName]);
    sheet.addRow(['Last Name', user?.profile?.lastName]);
    sheet.addRow(['Email', user?.email]);
    sheet.addRow(['User Name', user?.name]);
    sheet.addRow([' ']);

    sheet.addRow([
      'Simulation',
      'Action',
      'Venue',
      'VP1',
      'VP2',
      'VP3',
      'Time',
      'Timer',
    ]);
    const logs = await this.logsRepository.find({
      filter: {
        userId: userId,
      },
    });

    logs?.map((log: any) => {
      sheet.addRow([
        log?.simulation?.name,
        log?.event,
        log?.screen,
        log?.viewports[0]?.simDoc?.title,
        log?.viewports[1]?.simDoc?.title,
        log?.viewports[2]?.simDoc?.title,
        `${moment(log?.createdAt).format('DD-MMM-YYYY')} ${moment(
          log?.createdAt,
        ).format('HH:mm:ss')}`,
        log?.duration !== 0
          ? moment.utc(log?.duration * 1000).format('HH:mm:ss')
          : '--',
      ]);
    });

    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.value || cell.value == 0) {
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
          };
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `${user?.profile?.lastName}_${user?.name}_UserLogs`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          book.xlsx
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

  async getUserCardData(data: any) {
    if (!data) {
      throw new NotFoundException('No data to download.');
    }
    // console.log(JSON.parse(data.data));
    // try {
    const datas = JSON.parse(data.data);

    //creating workbook
    const book = new Workbook();

    //adding a worksheet to workbook
    const sheet = book.addWorksheet('Score');
    const sheet3 = book.addWorksheet('Undefied Findings');
    const sheet2 = book.addWorksheet('Monitoring Notes');

    // Score sheet
    const title = sheet.addRow(['CRA ASSESSMENTS', ' ', ' ', ' ', ' ']);
    sheet.mergeCells(`A1:E1`);
    title.getCell(1).font = {
      size: 25,
    };
    title.height = 35;

    sheet.addRow(' ');

    datas.userInfo?.data.forEach((doc) => {
      sheet.addRow([doc]);
    });
    sheet.addRow(' ');
    sheet.addRow(' ');

    const resultTitle = sheet.addRow(['Results Summary', ' ', ' ', ' ', ' ']);
    sheet.mergeCells(
      `${resultTitle.getCell(1).address}:${resultTitle.getCell(5).address}`,
    );
    resultTitle.getCell(1).font = {
      size: 15,
      bold: true,
    };
    resultTitle.height = 35;
    sheet.addRow(' ');
    //result summary
    const resultCol = sheet.addRow(datas.resultSummary.columns);
    for (let index = 0; index < 3; index++) {
      resultCol.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '999999' },
      };
      resultCol.getCell(index + 1).font = {
        bold: true,
      };
    }
    datas.resultSummary?.rows.map((row, index) => {
      const added = sheet.addRow(row);
      added.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: datas.resultSummary?.pass[index] ? '008000' : 'f3f338',
        },
      };
    });
    sheet.addRow(' ');
    sheet.addRow(' ');

    //findingScore
    const findingTitle = sheet.addRow(['Findings Score', ' ', ' ', ' ', ' ']);
    sheet.mergeCells(
      `${findingTitle.getCell(1).address}:${findingTitle.getCell(5).address}`,
    );
    findingTitle.getCell(1).font = {
      size: 15,
      bold: true,
    };
    findingTitle.height = 35;
    sheet.addRow(' ');
    const severityCol = sheet.addRow(datas.findingScore?.severity.columns);
    for (let index = 0; index < 5; index++) {
      severityCol.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '999999' },
      };
    }
    sheet.addRows(datas.findingScore?.severity.rows);
    sheet.addRow(' ');
    const domainCol = sheet.addRow(datas.findingScore?.domain.columns);
    for (let index = 0; index < 5; index++) {
      domainCol.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '999999' },
      };
    }
    sheet.addRows(datas.findingScore?.domain.rows);
    sheet.addRow(' ');
    sheet.addRow(' ');
    //compliance
    //study
    let complianceTitle;
    if (datas.compliance.detail.rows.length !== 0) {
      complianceTitle = sheet.addRow([
        'Compliance Calculation Score',
        ' ',
        ' ',
        ' ',
        ' ',
      ]);
      sheet.mergeCells(
        `${complianceTitle.getCell(1).address}:${
          complianceTitle.getCell(5).address
        }`,
      );
      complianceTitle.getCell(1).font = {
        size: 15,
        bold: true,
      };
      complianceTitle.height = 35;
      sheet.addRow(' ');
      const studyCol = sheet.addRow(datas.compliance?.summary?.study.column);
      for (let index = 0; index < 5; index++) {
        studyCol.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '999999' },
        };
        studyCol.getCell(index + 1).font = {
          bold: true,
        };
      }
      sheet.addRows(datas.compliance?.summary?.study.rows);
      sheet.addRow(' ');
      sheet.addRow(' ');
      //rescue
      const rescueCol = sheet.addRow(datas.compliance?.summary?.rescue.column);
      for (let index = 0; index < 5; index++) {
        rescueCol.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '999999' },
        };
        rescueCol.getCell(index + 1).font = {
          bold: true,
        };
      }
      sheet.addRows(datas.compliance?.summary?.rescue.rows);
      sheet.addRow(' ');
      //detail
      const detailCol = sheet.addRow(datas.compliance?.detail.column);
      for (let index = 0; index < 4; index++) {
        detailCol.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '999999' },
        };
        rescueCol.getCell(index + 1).font = {
          bold: true,
        };
      }
      datas.compliance?.detail.rows.map((row) => {
        const added = sheet.addRow(row);
        if (row[1] == ' ') {
          sheet.mergeCells(
            `${added.getCell(1).address}:${added.getCell(4).address}`,
          );
          added.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'e6f2ff' },
          };
        } else if (row[1] === 'Correct') {
          added.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '008000' },
          };
        } else if (row[1] === 'Incorrect') {
          added.getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'd13212' },
          };
        }
      });
      sheet.addRow(' ');
      sheet.addRow(' ');
    }

    //process
    const processTitle = sheet.addRow(['Process Issues', ' ', ' ', ' ', ' ']);
    sheet.mergeCells(
      `${processTitle.getCell(1).address}:${processTitle.getCell(5).address}`,
    );
    processTitle.getCell(1).font = {
      size: 15,
      bold: true,
    };
    processTitle.height = 35;
    sheet.addRow(' ');
    const processCol = sheet.addRow(datas.process?.column);
    for (let index = 0; index < 3; index++) {
      processCol.getCell(index + 1).font = {
        bold: true,
      };
    }
    sheet.mergeCells(
      `${processCol.getCell(3).address}:${processCol.getCell(5).address}`,
    );
    datas.process?.rows.map((row, index) => {
      const added = sheet.addRow(row);
      sheet.mergeCells(
        `${added.getCell(3).address}:${added.getCell(5).address}`,
      );
      if (index == 0) {
        added.height = Number(added.getCell(2)) * 16;
      }
      added.getCell(1).font = {
        bold: true,
      };
      added.getCell(3).alignment = {
        wrapText: true,
        horizontal: 'center',
        vertical: 'middle',
      };
    });

    sheet.addRow(' ');
    sheet.addRow(' ');

    const msg = sheet.addRow([
      'The information in this document is confidential.',
      ' ',
      ' ',
      ' ',
      ' ',
    ]);
    sheet.mergeCells(`${msg.getCell(1).address}:${msg.getCell(5).address}`);
    msg.getCell(1).font = {
      bold: true,
    };
    msg.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffad33' },
    };

    // column auto width
    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.value || cell.value == 0) {
          cell.alignment = {
            ...cell.alignment,
            // wrapText: true,
            horizontal: 'center',
            vertical: 'middle',
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
        if (cell.isMerged) {
          return;
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });

    // title.getCell(1).border = {
    //   top: { style: 'thick' },
    //   left: { style: 'thick' },
    //   bottom: { style: 'thick' },
    //   right: { style: 'thick' },
    // };
    // resultTitle.getCell(1).border = {
    //   top: { style: 'thick' },
    //   left: { style: 'thick' },
    //   bottom: { style: 'thick' },
    //   right: { style: 'thick' },
    // };
    // findingTitle.getCell(1).border = {
    //   top: { style: 'thick' },
    //   left: { style: 'thick' },
    //   bottom: { style: 'thick' },
    //   right: { style: 'thick' },
    // };
    // processTitle.getCell(1).border = {
    //   top: { style: 'thick' },
    //   left: { style: 'thick' },
    //   bottom: { style: 'thick' },
    //   right: { style: 'thick' },
    // };

    // if (complianceTitle != undefined) {
    //   complianceTitle.getCell(1).border = {
    //     top: { style: 'thick' },
    //     left: { style: 'thick' },
    //     bottom: { style: 'thick' },
    //     right: { style: 'thick' },
    //   };
    // }

    // unidenfied findings sheet
    datas.userInfo?.data.forEach((doc) => {
      sheet2.addRow([doc]);
    });
    sheet2.addRow(' ');
    sheet2.addRow(' ');

    const notesTitle = sheet2.addRow(['Monitoring Notes', ' ', ' ', ' ']);
    sheet2.mergeCells(
      `${notesTitle.getCell(1).address}:${notesTitle.getCell(4).address}`,
    );
    notesTitle.getCell(1).font = {
      size: 15,
      bold: true,
    };
    notesTitle.height = 35;
    sheet2.addRow(' ');

    const notesCol = sheet2.addRow(datas.monitoring?.column);
    for (let index = 0; index < 4; index++) {
      notesCol.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'e6f2ff' },
      };
      notesCol.getCell(index + 1).font = {
        bold: true,
      };
    }
    sheet2.addRows(datas.monitoring?.rows);
    sheet2.addRow(' ');
    sheet2.addRow(' ');
    const msg3 = sheet2.addRow([
      'The information in this document is confidential.',
      ' ',
      ' ',
      ' ',
    ]);
    sheet2.mergeCells(`${msg3.getCell(1).address}:${msg3.getCell(4).address}`);
    msg3.getCell(1).font = {
      bold: true,
    };
    msg3.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffad33' },
    };

    // column auto width
    sheet2.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.isMerged) {
          return;
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
    sheet2.eachRow((row) => {
      row['eachCell']({ includeEmpty: true }, function (cell) {
        cell.alignment = {
          ...cell.alignment,
          wrapText: true,
          horizontal: 'center',
          vertical: 'middle',
        };
        if (row.number < 6) {
          if (cell.value) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }
          return;
        }
        if (cell.value) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
    });

    // monitoring notes sheet
    datas.userInfo?.data.forEach((doc) => {
      sheet3.addRow([doc]);
    });
    sheet3.addRow(' ');
    sheet3.addRow(' ');

    const unidefinedTitle = sheet3.addRow([
      'Unidentified Findings',
      ' ',
      ' ',
      ' ',
      ' ',
    ]);
    sheet3.mergeCells(
      `${unidefinedTitle.getCell(1).address}:${
        unidefinedTitle.getCell(9).address
      }`,
    );
    unidefinedTitle.getCell(1).font = {
      size: 15,
      bold: true,
    };
    unidefinedTitle.height = 35;
    sheet3.addRow(' ');

    const unidentifiedCol = sheet3.addRow(datas.unidentified?.column);
    for (let index = 0; index < 9; index++) {
      unidentifiedCol.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'e6f2ff' },
      };
      unidentifiedCol.getCell(index + 1).font = {
        bold: true,
      };
    }
    sheet3.addRows(datas.unidentified?.rows);
    sheet3.addRow(' ');
    sheet3.addRow(' ');
    const msg2 = sheet3.addRow([
      'The information in this document is confidential.',
      ' ',
      ' ',
      ' ',
      ' ',
    ]);
    sheet3.mergeCells(`${msg2.getCell(1).address}:${msg2.getCell(9).address}`);
    msg2.getCell(1).font = {
      bold: true,
    };
    msg2.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffad33' },
    };

    // column auto width
    sheet3.columns.forEach(function (column, i) {
      let maxLength = 0;
      column['eachCell']({ includeEmpty: true }, function (cell) {
        if (cell.isMerged) {
          return;
        }
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength > 100 ? 100 : maxLength;
    });
    sheet3.eachRow((row) => {
      row['eachCell']({ includeEmpty: true }, function (cell) {
        cell.alignment = {
          ...cell.alignment,
          wrapText: true,
          horizontal: 'center',
          vertical: 'middle',
        };
        if (row.number < 6) {
          if (cell.value) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }
          return;
        }
        if (row.getCell(1).value !== undefined) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        }
      });
    });

    const File = await new Promise((resolve, reject) => {
      //0600: user can write , can read but cant execute.
      tmp.file(
        {
          discardDescriptor: true,
          prefix: `${datas.user.name}_${datas.user.simId}`,
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          //writing the temporary file
          book.xlsx
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
    // } catch (error) {
    //   throw new NotFoundException('Please try later.');
    // }
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class SortNPaginationService {
  createCaseInsensitiveSortNPaginationPipeline(sortBy, skip, limit) {
    const sortField = sortBy.id;
    const sortOrder = sortBy.desc ? -1 : 1;

    return [
      {
        $addFields: {
          lowerCaseField: { $toLower: `$${sortField}` },
        },
      },
      {
        $sort: { lowerCaseField: sortOrder },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
  }
}

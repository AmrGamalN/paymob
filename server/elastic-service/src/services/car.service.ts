import {
  HandleError,
  ResponseOptions,
  serviceResponse,
} from '@amrogamal/shared-code';
import { elasticClient } from '../configs/elastic.config';
import {
  ElasticCreateType,
  ElasticSearchType,
  ElasticMappingCar,
  ElasticUpdateType,
  ElasticDeleteType,
  ElaticCarSettings,
  ElasticCarMappings,
} from '../types/elastic.type';
const { warpError } = HandleError.getInstance();

export class CarService {
  private static instance: CarService;

  public static getInstance(): CarService {
    if (!CarService.instance) {
      this.instance = new CarService();
    }
    return this.instance;
  }

  createMapping = async (): Promise<ResponseOptions> => {
    const exists = await elasticClient.indices.exists({ index: 'cars' });
    if (exists)
      return serviceResponse({
        statusText: 'Conflict',
        message: 'Index already exists',
      });

    await elasticClient.indices.create({
      index: 'cars',
      settings: ElasticMappingCar.settings as ElaticCarSettings,
      mappings: ElasticMappingCar.mappings as ElasticCarMappings,
    });

    return serviceResponse({
      statusText: 'Created',
      message: 'Index created successfully',
    });
  };

  create = warpError(async ({ data, index, id }: ElasticCreateType) => {
    await elasticClient.index({
      index,
      id,
      document: data,
      refresh: 'wait_for',
    });
  });

  get = warpError(async (id: string): Promise<ResponseOptions> => {
    const { _source } = await elasticClient.get({
      index: 'cars',
      id,
    });
    return serviceResponse({ data: _source });
  });

  searchCar = warpError(
    async (
      query: ElasticSearchType,
      page: number = 1,
      limit: number = 10,
    ): Promise<ResponseOptions> => {
      const { esQuery, from } = await this.helperSearch(query, page, limit);
      const { hits } = await elasticClient.search({
        index: 'cars',
        query: esQuery,
        size: limit,
        from,
        // sort,
      });
      const results = hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
      }));

      return serviceResponse({
        statusText: 'OK',
        message: 'Search successfully',
        data: results,
      });
    },
  );

  private helperSearch = async (
    query: ElasticSearchType,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ esQuery: any; from: number }> => {
    const from = (page - 1) * limit;
    const skipKeys = ['city', 'minPrice', 'maxPrice'];
    const mustQueries: any = [];
    const rangeQuery: { price?: { gte?: number; lte?: number } } = {};

    if (query.city) {
      mustQueries.push({ match: { 'location.city': query.city } });
    }

    if (query.minPrice && query.maxPrice) {
      rangeQuery.price = {
        gte: query.minPrice,
        lte: query.maxPrice,
      };
    }

    for (const [key, value] of Object.entries(query)) {
      if (skipKeys.includes(key)) continue;
      if (['brand', 'model', 'name'].includes(key)) {
        mustQueries.push({
          match: {
            [key]: {
              query: value,
              fuzziness: 'AUTO',
            },
          },
        });
      } else if (key === 'color') {
        mustQueries.push({
          term: {
            color: value,
          },
        });
      } else {
        mustQueries.push({
          match: { [key]: value },
        });
      }
    }

    const esQuery =
      mustQueries.length || Object.keys(rangeQuery).length
        ? {
            bool: {
              must: mustQueries,
              ...(Object.keys(rangeQuery).length && {
                filter: [
                  {
                    range: rangeQuery,
                  },
                ],
              }),
            },
          }
        : { match_all: {} };

    return { esQuery, from };
  };

  update = async ({ data, index, id }: ElasticUpdateType): Promise<void> => {
    await elasticClient.update({
      index,
      id,
      doc: data,
    });
  };

  delete = async ({ index, id }: ElasticDeleteType): Promise<void> => {
    await elasticClient.delete({
      index,
      id,
    });
  };
}

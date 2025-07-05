import { CreateCar, UpdateCar } from './car.type';

export type ElasticCreateType = {
  data: CreateCar;
  index: string;
  id: string;
  userId?: string;
};

export type ElasticGetType = {
  id: string;
};

export type ElasticSearchType = {
  name: string;
  brand: string;
  color: string;
  carModel: string;
  city: string;
  category: string;
  year: number;
  minPrice: number;
  maxPrice: number;
  availableFrom: Date;
  availableTo: Date;
  isAvailable: boolean;
  allowNegotiate: boolean;
};

export type ElasticUpdateType = {
  data: UpdateCar;
  index: string;
  id: string;
};

export type ElasticDeleteType = {
  index: string;
  id: string;
};

export type ElasticMappingType = {
  index: string;
  body: MappingCar;
};

export const ElasticMappingCar = {
  settings: {
    analysis: {
      analyzer: {
        default: {
          type: 'standard',
          stopwords: '_none_',
        },
      },
    },
  },
  mappings: {
    properties: {
      userId: { type: 'keyword' },
      prefix: { type: 'keyword' },
      phone: { type: 'keyword' },
      name: { type: 'text' },
      description: { type: 'text' },
      carModel: { type: 'keyword' },
      brand: { type: 'keyword' },
      year: { type: 'integer' },
      color: { type: 'keyword' },
      category: { type: 'keyword' },
      images: {
        type: 'nested',
        properties: {
          url: { type: 'keyword' },
          key: { type: 'keyword' },
        },
      },
      price: { type: 'float' },
      availableFrom: { type: 'date' },
      availableTo: { type: 'date' },
      location: {
        properties: {
          lng: { type: 'float' },
        },
      },
    },
    isAvailable: { type: 'boolean' },
    allowNegotiate: { type: 'boolean' },
    guarantees: {
      properties: {
        hasInsurance: { type: 'boolean' },
        insuranceDetails: { type: 'text' },
        licenseValid: { type: 'boolean' },
        requiresDeposit: { type: 'boolean' },
        depositAmount: { type: 'float' },
        additionalNotes: { type: 'text' },
      },
    },
    expired_At: { type: 'date' },
    isExpired: { type: 'boolean' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};

export type ElaticCarSettings = {
  analysis: {
    analyzer: {
      default: {
        type: 'standard';
        stopwords: '_none_';
      };
    };
  };
};

export type ElasticCarMappings = {
  properties: {
    userId: { type: 'keyword' };
    prefix: { type: 'keyword' };
    phone: { type: 'keyword' };
    name: { type: 'text' };
    description: { type: 'text' };
    carModel: { type: 'keyword' };
    brand: { type: 'keyword' };
    year: { type: 'integer' };
    color: { type: 'keyword' };
    category: { type: 'keyword' };
    images: {
      type: 'nested';
      properties: {
        url: { type: 'keyword' };
        key: { type: 'keyword' };
      };
    };
    price: { type: 'float' };
    availableFrom: { type: 'date' };
    availableTo: { type: 'date' };
    location: {
      properties: {
        lng: { type: 'float' };
      };
    };
  };
  isAvailable: { type: 'boolean' };
  allowNegotiate: { type: 'boolean' };
  guarantees: {
    properties: {
      hasInsurance: { type: 'boolean' };
      insuranceDetails: { type: 'text' };
      licenseValid: { type: 'boolean' };
      requiresDeposit: { type: 'boolean' };
      depositAmount: { type: 'float' };
      additionalNotes: { type: 'text' };
    };
  };
  expired_At: { type: 'date' };
  isExpired: { type: 'boolean' };
  createdAt: { type: 'date' };
  updatedAt: { type: 'date' };
};

export type MappingCar = ElaticCarSettings & ElasticCarMappings;

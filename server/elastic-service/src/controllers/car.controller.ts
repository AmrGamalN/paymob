import { Request, Response } from 'express';
import { controllerResponse } from '@amrogamal/shared-code';
import { CarService } from '../services/car.service';
import { SearchCar } from '../types/car.type';

export class CarController {
  static instance: CarController;
  private carService: CarService;
  private constructor() {
    this.carService = CarService.getInstance();
  }
  public static getInstance(): CarController {
    if (!CarController.instance) {
      this.instance = new CarController();
    }
    return this.instance;
  }

  createMapping = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.carService.createMapping();
    return controllerResponse(res, result);
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.carService.get(req.params.id);
    return controllerResponse(res, result);
  };

  searchCar = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit, ...query } = req.query;
    const Queries = {
      name: query.name,
      brand: query.brand,
      carModel: query.model,
      year: Number(query.year),
      category: query.category,
      isAvailable: Boolean(query.isAvailable),
      allowNegotiate: Boolean(query.allowNegotiate),
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      color: query.color,
      city: query.city,
      availableFrom: query.availableFrom
        ? new Date(query.availableFrom.toString())
        : undefined,
      availableTo: query.availableTo
        ? new Date(query.availableTo.toString())
        : undefined,
    };
    const result = await this.carService.searchCar(
      Queries as SearchCar,
      Number(page),
      Number(limit),
    );
    return controllerResponse(res, result);
  };
}

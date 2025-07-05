import { Request, Response } from 'express';
import { CategoryService } from '../../services/car/category.service';
import { controllerResponse, HandleError } from '@amrogamal/shared-code';
const handleError = HandleError.getInstance().handleError;

export class CategoryController {
  private static instance: CategoryController;
  private categoryService: CategoryService;
  constructor() {
    this.categoryService = CategoryService.getInstance();
  }

  public static getInstance(): CategoryController {
    if (!CategoryController.instance) {
      CategoryController.instance = new CategoryController();
    }
    return CategoryController.instance;
  }

  create = handleError(
    async (req: Request, res: Response): Promise<Response> => {
      const file = req.file as Express.Multer.File;
      const response = await this.categoryService.create(req.body, file);
      return controllerResponse(res, response);
    },
  );

  getAll = handleError(
    async (req: Request, res: Response): Promise<Response> => {
      const response = await this.categoryService.getAll();
      return controllerResponse(res, response);
    },
  );

  getById = handleError(
    async (req: Request, res: Response): Promise<Response> => {
      const response = await this.categoryService.getById(req.params.id);
      return controllerResponse(res, response);
    },
  );

  update = handleError(
    async (req: Request, res: Response): Promise<Response> => {
      const file = req.file as Express.Multer.File;
      const response = await this.categoryService.update(
        req.params.id,
        req.body,
        file,
      );
      return controllerResponse(res, response);
    },
  );

  delete = handleError(
    async (req: Request, res: Response): Promise<Response> => {
      const response = await this.categoryService.delete(req.params.id);
      return controllerResponse(res, response);
    },
  );
}


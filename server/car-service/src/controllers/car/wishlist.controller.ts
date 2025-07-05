import { Request, Response } from 'express';
import { WishlistService } from '../../services/car/wishlist.service';
import { controllerResponse } from '@amrogamal/shared-code';

export class WishlistController {
  private static instance: WishlistController;
  private wishlistService: WishlistService;
  constructor() {
    this.wishlistService = WishlistService.getInstance();
  }

  public static getInstance(): WishlistController {
    if (!WishlistController.instance) {
      WishlistController.instance = new WishlistController();
    }
    return WishlistController.instance;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.wishlistService.create(
      req.body,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.wishlistService.get(
      req.params.id,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.wishlistService.getAll(
      String(req.curUser?.userId),
      Number(req.query.page),
      Number(req.query.limit),
    );
    return controllerResponse(res, response);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.wishlistService.delete(
      req.body,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };
}

import { Request, Response } from 'express';
import { OrderService } from '../../services/car/order.service';
import { controllerResponse } from '@amrogamal/shared-code';
import { UserToken } from '../../types/request.type';

export class OrderController {
  private static instance: OrderController;
  private orderService: OrderService;

  constructor() {
    this.orderService = OrderService.getInstance();
  }

  public static getInstance(): OrderController {
    if (!OrderController.instance) {
      OrderController.instance = new OrderController();
    }
    return OrderController.instance;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.create(
      req.body,
      req.curUser as UserToken,
    );
    return controllerResponse(res, response);
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.getAll(
      String(req.curUser?.userId),
      Number(req.query.page),
      Number(req.query.limit),
    );
    return controllerResponse(res, response);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.getById(
      req.params.id,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.updateStatus(
      req.params.id,
      req.body,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };

  count = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.count(String(req.curUser?.userId));
    return controllerResponse(res, response);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const response = await this.orderService.delete(
      req.params.id,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, response);
  };
}

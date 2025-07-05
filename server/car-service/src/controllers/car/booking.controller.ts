import { Request, Response } from 'express';
import { BookingService } from '../../services/car/booking.service';
import { controllerResponse } from '@amrogamal/shared-code';

export class BookingController {
  private static instance: BookingController;
  public static getInstance(): BookingController {
    if (!BookingController.instance)
      BookingController.instance = new BookingController();
    return BookingController.instance;
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    const result = await BookingService.getInstance().create(
      req.body,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, result);
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query;
    const result = await BookingService.getInstance().getAll(
      String(req.curUser?.userId),
      Number(page),
      Number(limit),
    );
    return controllerResponse(res, result);
  };

  get = async (req: Request, res: Response): Promise<Response> => {
    const result = await BookingService.getInstance().get(
      req.params.id,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, result);
  };

  updateByRenter = async (req: Request, res: Response): Promise<Response> => {
    const result = await BookingService.getInstance().updateByRenter(
      req.params.id,
      String(req.curUser?.userId),
      req.body,
    );
    return controllerResponse(res, result);
  };

  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const result = await BookingService.getInstance().updateStatus(
      req.params.id,
      String(req.curUser?.userId),
      req.body.status,
    );
    return controllerResponse(res, result);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const result = await BookingService.getInstance().delete(
      req.params.id,
      String(req.curUser?.userId),
    );
    return controllerResponse(res, result);
  };
}

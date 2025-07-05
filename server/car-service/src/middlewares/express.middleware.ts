import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { HandleError, CustomError } from '@amrogamal/shared-code';
const { handleError } = HandleError.getInstance();

export const expressValidator = (
  validators: ValidationChain[],
): RequestHandler => {
  return handleError(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response | void> => {
      for (const validator of validators) {
        await validator?.run(req);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (!res.headersSent) {
          return res.status(400).json({
            success: false,
            status: 400,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
              err,
            })),
          });
        }
      }
      return next();
    },
  );
};

export const requiredId = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.params?.id || !/^[a-fA-F0-9]{24}$/.test(req.params?.id))
      throw new CustomError('NotFound', 404, 'Not Found', false);
    return next();
  };
};

export const requiredUserIdMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.params.userId;
    if (
      !userId ||
      !/^[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/.test(userId)
    )
      throw new CustomError('NotFound', 404, 'Not Found', false);
    return next();
  };
};

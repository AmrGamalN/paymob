import { NextFunction, Request, Response } from 'express';
import { CustomError, HandleError } from '@amrogamal/shared-code';
import { auth } from '../configs/firebase.config';
import { UserToken } from '../types/request.type';
const { handleError } = HandleError.getInstance();

declare module 'express-serve-static-core' {
  interface Request {
    curUser?: UserToken;
  }
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  authorization = (role: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.curUser?.role)
        throw new CustomError('Forbidden', 403, 'Access denied', false);

      if (!role.includes(req.curUser?.role))
        throw new CustomError('Forbidden', 403, 'Access denied', false);
      return next();
    };
  };

  verifyToken = handleError(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<Response | void> => {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token)
        throw new CustomError('Unauthorized', 401, 'Unauthorized', false);
      const decoded = await auth.verifyIdToken(token);
      if (!decoded)
        throw new CustomError('Unauthorized', 401, 'Unauthorized', false);
      req.curUser = {
        ...decoded,
        userId: decoded?.userId,
        role: decoded?.role,
        lastSeen: new Date(),
      } as UserToken;
      return next();
    },
  );
}

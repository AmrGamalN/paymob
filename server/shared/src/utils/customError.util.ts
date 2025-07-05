import { ResponseType } from '../types/response.type';

export class CustomError extends Error {
  statusCode: number;
  success: boolean;
  statusText: string;
  constructor(
    statusText: ResponseType,
    statusCode: number = 500 | 404 | 400 | 409 | 403 | 401,
    message: string,
    success: true | false,
  ) {
    super(message);
    this.statusText = statusText;
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.success = success;
    Error.captureStackTrace(this, this.constructor);
  }
}

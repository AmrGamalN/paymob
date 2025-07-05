import { CustomError, logger } from '@amrogamal/shared-code';
import { Request, Response, NextFunction } from 'express';
const parserFieldBoolean = ['isAvailable', 'allowNegotiate'];
const parserFieldNumber = ['year', 'discount', 'depositAmount', 'price'];
const parserObject = ['location', 'guarantees'];
const parserArray = ['keys'];
const parserImage = ['carImages', 'categoryImage'];

export class ParserField {
  private static Instance: ParserField;
  public static getInstance(): ParserField {
    if (!ParserField.Instance) {
      ParserField.Instance = new ParserField();
    }
    return ParserField.Instance;
  }

  requiredImage = (field: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const files = req.files as {
        [fieldname: string]: Express.MulterS3.File[];
      };
      const isMissing =
        !files ||
        !files[field] ||
        !Array.isArray(files[field]) ||
        files[field].length === 0;
      if (isMissing) {
        throw new CustomError(
          'BadRequest',
          400,
          `Image is required in field "${field}"`,
          false,
        );
      }
      return next();
    };
  };

  parserFields = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      let hasError = false;
      for (const field of Object.keys(req.body)) {
        const value = req.body[field.trim()];
        try {
          if (parserFieldBoolean.includes(field)) {
            req.body[field] = Boolean(value);
          } else if (parserFieldNumber.includes(field)) {
            req.body[field] = Number(value);
          } else if (parserObject.includes(field)) {
            req.body[field] = JSON.parse(value);
          } else if (parserArray.includes(field))
            req.body[field] = value.split(',');
          else {
            if (!parserImage.includes(field)) req.body[field] = value;
          }
        } catch (error) {
          if (!hasError) {
            hasError = true;
            logger.error(error);
            throw new CustomError(
              'BadRequest',
              400,
              `Invalid field "${field}"`,
              false,
            );
          }
        }
      }
      return next();
    };
  };

  parserImages = () => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.files) {
        return next();
      }
      for (const file in req.files) {
        if (parserImage.includes(file)) {
          const images = req.files as {
            [fieldname: string]: Express.MulterS3.File[];
          };
          req.body[file] = images[file]?.map((file) => ({
            url: file.location,
            key: file.key,
          }));
        }
      }
      return next();
    };
  };
}

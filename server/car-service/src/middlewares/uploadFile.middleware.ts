import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer, { MulterError, Options } from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../configs/s3Bucket.config';
import { HandleError, logger } from '@amrogamal/shared-code';
import { FileFilterCallback } from 'multer';
const { handleError } = HandleError.getInstance();

declare global {
  namespace Express {
    interface Request {
      fileIndex?: number;
      prefix?: string;
      prefixType?: string;
    }
  }
}

export class UploadFile {
  private static Instance: UploadFile;
  public static getInstance(): UploadFile {
    if (!UploadFile.Instance) {
      UploadFile.Instance = new UploadFile();
    }
    return UploadFile.Instance;
  }

  private callbackFunction = (): Options => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    return {
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback,
      ): void => {
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only .png, .jpg, and .jpeg formats are allowed!'));
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
        files: 5,
      },
    };
  };

  uploadMulter = multer({
    storage: multer.memoryStorage(),
    ...this.callbackFunction(),
  });

  private uploadMulterS3 = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: String(process.env.AWS_BUCKET_NAME),
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },

      key: function (req: Request, file, cb) {
        if (!req.prefix) {
          req.prefix = uuidv4();
        }
        req.body.prefix = req.prefix;
        const prefixType = req.prefixType;
        const prefix =
          prefixType === 'cars'
            ? `${prefixType}/${req.prefix}/${uuidv4()}-${file.originalname}`
            : `${prefixType}/${uuidv4()}-${file.originalname}`;
        cb(null, prefix);
      },
    }),

    ...this.callbackFunction(),
  });

  private uploadFile =
    (uploadMiddleware: RequestHandler): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
      uploadMiddleware(req, res, (err: unknown) => {
        if (!err) return next();

        const status = err instanceof MulterError ? 400 : 500;
        const message =
          err instanceof MulterError
            ? `File upload error: ${err.message}`
            : `Unknown file upload error`;

        logger.error(err);
        res.status(status).json({
          success: false,
          message,
          error: err,
        });
      });
    };

  prefixType = (prefixType: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      req.prefixType = prefixType;
      next();
    };
  };

  uploadListMulterS3Images = (
    name: string,
    maxCount: number,
  ): RequestHandler => {
    return handleError(
      this.uploadFile(this.uploadMulterS3.fields([{ name, maxCount }])),
    );
  };

  uploadListMulterImages = (name: string, maxCount: number): RequestHandler => {
    return handleError(
      this.uploadFile(this.uploadMulter.fields([{ name, maxCount }])),
    );
  };

  uploadSingleMulterImages = (name: string): RequestHandler => {
    return handleError(this.uploadFile(this.uploadMulter.single(name)));
  };
}
